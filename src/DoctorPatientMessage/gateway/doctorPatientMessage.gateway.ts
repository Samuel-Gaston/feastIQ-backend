import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { MessageType } from '../schemas/chat-message.schema';

interface AuthSocket extends Socket {
  userId: string;
  userName: string;
  userRole: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*', // tighten this in production
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Validate JWT on connection ────────────────────────────────────────
  async handleConnection(client: AuthSocket) {
    try {
      // Token comes from handshake auth: socket = io(url, { auth: { token } })
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token — disconnecting`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') as string,
      });

      // Attach user info to the socket for later use
      client.userId   = payload.sub;
      client.userName = payload.name  || 'Unknown';
      client.userRole = payload.role  || 'PATIENT';

      this.logger.log(`✅ ${client.userRole} ${client.userName} connected [${client.id}]`);
    } catch (err) {
      this.logger.warn(`Client ${client.id} sent invalid token — disconnecting`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    this.logger.log(`❌ ${client.userName || 'Unknown'} disconnected [${client.id}]`);
  }

  // ─── JOIN a specific appointment room ─────────────────────────────────
  // Client emits: socket.emit('joinRoom', appointmentId)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() appointmentId: string,
  ) {
    try {
      // Verify this user actually belongs to this appointment
      await this.chatService.verifyAccess(appointmentId, client.userId);

      const room = `appointment-${appointmentId}`;
      client.join(room);

      this.logger.log(`${client.userName} joined room ${room}`);

      // Send back existing message history
      const history = await this.chatService.getMessages(appointmentId);
      client.emit('messageHistory', history);

      // Notify the room someone joined (system message style)
      client.to(room).emit('userJoined', {
        userId:   client.userId,
        userName: client.userName,
        role:     client.userRole,
      });

      return { success: true, room };
    } catch (err: any) {
      client.emit('error', { message: err.message || 'Failed to join room' });
      return { success: false };
    }
  }

  // ─── LEAVE a room ──────────────────────────────────────────────────────
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() appointmentId: string,
  ) {
    const room = `appointment-${appointmentId}`;
    client.leave(room);
    this.logger.log(`${client.userName} left room ${room}`);
    client.to(room).emit('userLeft', { userName: client.userName });
  }

  // ─── SEND a message ────────────────────────────────────────────────────
  // Client emits: socket.emit('sendMessage', { appointmentId, content })
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { appointmentId: string; content: string },
  ) {
    try {
      if (!data.content?.trim()) return;

      // Verify access and get sender role
      const { senderName, senderRole } = await this.chatService.verifyAccess(
        data.appointmentId,
        client.userId,
      );

      // Save message to MongoDB
      const saved = await this.chatService.saveMessage({
        appointmentId: data.appointmentId,
        senderId:      client.userId,
        senderName,
        senderRole,
        content:       data.content.trim(),
        messageType:   MessageType.TEXT,
      });

      const room = `appointment-${data.appointmentId}`;

      // Broadcast to EVERYONE in the room including the sender
      // so the sender's own message appears confirmed
      this.server.to(room).emit('newMessage', {
        _id:          saved._id,
        appointment:  data.appointmentId,
        sender:       client.userId,
        senderName,
        senderRole,
        content:      saved.content,
        messageType:  saved.messageType,
        sentAt:       saved.sentAt,
      });

      // Stop the typing indicator since they sent
      client.to(room).emit('stopTyping', { userId: client.userId });

    } catch (err: any) {
      client.emit('error', { message: err.message || 'Failed to send message' });
    }
  }

  // ─── TYPING indicator ──────────────────────────────────────────────────
  // Client emits: socket.emit('typing', appointmentId)
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() appointmentId: string,
  ) {
    const room = `appointment-${appointmentId}`;
    // Broadcast to everyone EXCEPT the sender
    client.to(room).emit('userTyping', {
      userId:   client.userId,
      userName: client.userName,
      role:     client.userRole,
    });
  }

  // ─── STOP TYPING indicator ─────────────────────────────────────────────
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() appointmentId: string,
  ) {
    const room = `appointment-${appointmentId}`;
    client.to(room).emit('stopTyping', { userId: client.userId });
  }
}