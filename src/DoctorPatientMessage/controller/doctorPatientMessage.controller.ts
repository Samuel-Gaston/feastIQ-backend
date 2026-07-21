import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from '../service/doctorPatientMessage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations/doctor')
  getDoctorConversations(@Req() req: any) {
    return this.chatService.getDoctorChatAppointments(req.user._id);
  }

  @Get('messages/:appointmentId')
  async getMessages(@Req() req: any, @Param('appointmentId') appointmentId: string) {
    await this.chatService.verifyAccess(appointmentId, req.user._id);
    return this.chatService.getMessages(appointmentId);
  }
}