import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AdminMessage } from "../schema/adminMessage.schema";
import { Patient } from "../../patient/schemas/patient.schema";
import { User } from "../../user/schemas/user.schema";
import { SendMessageDTO, AdminReplyDTO } from "../dto/create-adminMesssage.dto";

@Injectable()
export class AdminMessageService {
  constructor(
    @InjectModel(AdminMessage.name)
    private readonly messageModel: Model<AdminMessage>,
    @InjectModel(Patient.name)
    private readonly patientModel: Model<Patient>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  // ─── PATIENT: Send a message to admin ─────────────────────────────────
  // Creates the thread if it doesn't exist yet (one thread per patient)
  async sendMessage(userId: string, dto: SendMessageDTO): Promise<AdminMessage> {
    const patient = await this.patientModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate({ path: 'user', select: 'name email' });

    if (!patient) throw new NotFoundException('Patient profile not found');

    const user = patient.user as any;
    const patientName  = user?.name  || patient.name  || 'Patient';
    const patientEmail = user?.email || patient.email || '';

    const newMessage = {
      sender:     new Types.ObjectId(userId),
      senderName: patientName,
      senderRole: 'PATIENT',
      content:    dto.content,
      sentAt:     new Date(),
    };

    // Upsert: find existing thread or create a new one
    let thread = await this.messageModel.findOne({ patient: patient._id });

    if (!thread) {
      thread = await this.messageModel.create({
        patient:      patient._id,
        patientName,
        patientEmail,
        messages:     [newMessage],
        lastMessage:  dto.content,
        lastMessageAt: new Date(),
        unreadByAdmin: 1,
        unreadByPatient: 0,
      });
    } else {
      thread.messages = [...(thread.messages || []), newMessage];
      thread.lastMessage    = dto.content;
      thread.lastMessageAt  = new Date();
      thread.unreadByAdmin  = (thread.unreadByAdmin || 0) + 1;
      await thread.save();
    }

    return thread;
  }

  // ─── PATIENT: Get own thread with admin ────────────────────────────────
  async getMyThread(userId: string): Promise<AdminMessage | null> {
    const patient = await this.patientModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const thread = await this.messageModel.findOne({ patient: patient._id });

    // Mark patient-side as read
    if (thread && (thread.unreadByPatient || 0) > 0) {
      thread.unreadByPatient = 0;
      await thread.save();
    }

    return thread;
  }

  // ─── ADMIN: Get all patient threads (sorted by most recent) ───────────
  async getAllThreads(): Promise<AdminMessage[]> {
    return this.messageModel
      .find()
      .sort({ lastMessageAt: -1 });
  }

  // ─── ADMIN: Get one thread by threadId ────────────────────────────────
  async getThread(threadId: string): Promise<AdminMessage> {
    const thread = await this.messageModel.findById(threadId);
    if (!thread) throw new NotFoundException('Thread not found');

    // Mark admin-side as read
    if ((thread.unreadByAdmin || 0) > 0) {
      thread.unreadByAdmin = 0;
      await thread.save();
    }

    return thread;
  }

  // ─── ADMIN: Reply to a patient thread ─────────────────────────────────
  async adminReply(
    threadId: string,
    dto: AdminReplyDTO,
    adminUser: { _id: any; name?: string },
  ): Promise<AdminMessage> {
    const thread = await this.messageModel.findById(threadId);
    if (!thread) throw new NotFoundException('Thread not found');

    const adminName = adminUser.name || 'Admin';

    const replyMessage = {
      sender:     new Types.ObjectId(adminUser._id),
      senderName: adminName,
      senderRole: 'ADMIN',
      content:    dto.content,
      sentAt:     new Date(),
    };

    thread.messages      = [...(thread.messages || []), replyMessage];
    thread.lastMessage   = dto.content;
    thread.lastMessageAt = new Date();
    thread.unreadByPatient = (thread.unreadByPatient || 0) + 1;
    thread.unreadByAdmin   = 0; // admin just read it by replying

    await thread.save();
    return thread;
  }

  // ─── ADMIN: Delete a thread ────────────────────────────────────────────
  async deleteThread(threadId: string): Promise<AdminMessage> {
    const thread = await this.messageModel.findByIdAndDelete(threadId);
    if (!thread) throw new NotFoundException('Thread not found');
    return thread;
  }

  // ─── Stats for admin dashboard cards ──────────────────────────────────
  async getStats() {
    const [total, unread, read] = await Promise.all([
      this.messageModel.countDocuments(),
      this.messageModel.countDocuments({ unreadByAdmin: { $gt: 0 } }),
      this.messageModel.countDocuments({ unreadByAdmin: 0 }),
    ]);
    return { total, unread, read };
  }
}