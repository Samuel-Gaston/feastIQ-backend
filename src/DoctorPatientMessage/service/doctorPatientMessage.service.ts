import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ChatMessage, MessageType } from "../schema/doctorPatientMessage.schema";
import { Appointment } from "../../appointment/schemas/appointment.schema";
import { Patient } from "../../patient/schemas/patient.schema";
import { Doctor } from "../../doctor/schemas/doctor.schema";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly chatModel: Model<ChatMessage>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Patient.name)
    private readonly patientModel: Model<Patient>,
    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<Doctor>,
  ) {}

  // ─── Verify appointment exists and user belongs to it ─────────────────
  async verifyAccess(appointmentId: string, userId: string): Promise<{
    appointment: any;
    senderName: string;
    senderRole: 'DOCTOR' | 'PATIENT';
  }> {
    const appointment = await this.appointmentModel
      .findById(appointmentId)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    if (!appointment) throw new NotFoundException('Appointment not found');

    // Check if the user is the patient
    const patient = await this.patientModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (patient && appointment.patient) {
      const apptPatientId = (appointment.patient as any)._id?.toString();
      if (apptPatientId === patient._id.toString()) {
        const name = (appointment.patient as any).user?.name || 'Patient';
        return { appointment, senderName: name, senderRole: 'PATIENT' };
      }
    }

    // Check if the user is the doctor
    const doctor = await this.doctorModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (doctor && appointment.doctor) {
      const apptDoctorId = (appointment.doctor as any)._id?.toString();
      if (apptDoctorId === doctor._id.toString()) {
        const name = (appointment.doctor as any).user?.name || 'Doctor';
        return { appointment, senderName: name, senderRole: 'DOCTOR' };
      }
    }

    throw new NotFoundException('You do not have access to this appointment chat');
  }

  // ─── Save a new message ────────────────────────────────────────────────
  async saveMessage(data: {
    appointmentId: string;
    senderId: string;
    senderName: string;
    senderRole: 'DOCTOR' | 'PATIENT';
    content: string;
    messageType?: MessageType;
  }): Promise<ChatMessage> {
    const msg = await this.chatModel.create({
      appointment: new Types.ObjectId(data.appointmentId),
      sender:      new Types.ObjectId(data.senderId),
      senderName:  data.senderName,
      senderRole:  data.senderRole,
      content:     data.content,
      messageType: data.messageType || MessageType.TEXT,
      sentAt:      new Date(),
    });
    return msg;
  }

  // ─── Get all messages for an appointment ──────────────────────────────
  async getMessages(appointmentId: string): Promise<ChatMessage[]> {
    return this.chatModel
      .find({ appointment: new Types.ObjectId(appointmentId) })
      .sort({ sentAt: 1 }) // oldest first
      .lean();
  }

  // ─── Get all appointments the logged-in patient has chats in ──────────
  async getPatientChatAppointments(userId: string) {
    const patient = await this.patientModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!patient) throw new NotFoundException('Patient profile not found');

    // Find appointments that belong to this patient and have at least one message
    const appointmentsWithMessages = await this.chatModel.aggregate([
      {
        $group: {
          _id: '$appointment',
          lastMessage: { $last: '$content' },
          lastMessageAt: { $last: '$sentAt' },
          messageCount: { $sum: 1 },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    // Get the appointment IDs
    const appointmentIds = appointmentsWithMessages.map(a => a._id);

    // Fetch appointments that belong to this patient
    const appointments = await this.appointmentModel
      .find({
        _id: { $in: appointmentIds },
        patient: patient._id,
      })
      .populate({ path: 'doctor', select: 'name specialization' })
      .lean();

    // Merge with message info
    return appointments.map(appt => {
      const msgInfo = appointmentsWithMessages.find(
        a => a._id.toString() === appt._id.toString()
      );
      return {
        ...appt,
        lastMessage:   msgInfo?.lastMessage || '',
lastMessageAt: msgInfo?.lastMessageAt || (appt as any).createdAt,
        messageCount:  msgInfo?.messageCount || 0,
      };
    });
  }

  // ─── Get all appointments the logged-in doctor has chats in ───────────
  async getDoctorChatAppointments(userId: string) {
    const doctor = await this.doctorModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    const appointmentsWithMessages = await this.chatModel.aggregate([
      {
        $group: {
          _id: '$appointment',
          lastMessage: { $last: '$content' },
          lastMessageAt: { $last: '$sentAt' },
          messageCount: { $sum: 1 },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const appointmentIds = appointmentsWithMessages.map(a => a._id);

    const appointments = await this.appointmentModel
      .find({
        _id: { $in: appointmentIds },
        doctor: doctor._id,
      })
      .populate({ path: 'patient', select: 'name email phone' })
      .lean();

    return appointments.map(appt => {
      const msgInfo = appointmentsWithMessages.find(
        a => a._id.toString() === appt._id.toString()
      );
      return {
        ...appt,
        lastMessage:   msgInfo?.lastMessage || '',
lastMessageAt: msgInfo?.lastMessageAt || (appt as any).createdAt,
        messageCount:  msgInfo?.messageCount || 0,
      };
    });
  }
}