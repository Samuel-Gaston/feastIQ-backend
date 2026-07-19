import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Patient } from "../../patient/schemas/patient.schema";

// A single message inside a thread
export class MessageEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender?: Types.ObjectId; // User._id of sender (patient or admin)

  @Prop({ required: true })
  senderName?: string; // stored directly for quick display

  @Prop({ required: true, enum: ['PATIENT', 'ADMIN'] })
  senderRole?: string;

  @Prop({ required: true })
  content?: string;

  @Prop({ default: () => new Date() })
  sentAt?: Date;
}

// One thread per patient — all messages between that patient and admin live here
@Schema({ timestamps: true })
export class AdminMessage extends Document {
  // The patient this thread belongs to
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, unique: true })
  patient?: Types.ObjectId;

  @Prop({ required: true })
  patientName?: string; // stored directly for quick list display

  @Prop({ required: true })
  patientEmail?: string;

  // All messages in this thread (patient + admin replies)
  @Prop({ type: [Object], default: [] })
  messages?: MessageEntry[];

  // Last message snapshot for list preview
  @Prop()
  lastMessage?: string;

  @Prop({ default: () => new Date() })
  lastMessageAt?: Date;

  // How many messages the admin hasn't read yet
  @Prop({ default: 0 })
  unreadByAdmin?: number;

  // How many admin replies the patient hasn't read yet
  @Prop({ default: 0 })
  unreadByPatient?: number;
}

export const AdminMessageSchema = SchemaFactory.createForClass(AdminMessage);

// Index for fast patient lookup
AdminMessageSchema.index({ patient: 1 }, { unique: true });
AdminMessageSchema.index({ lastMessageAt: -1 });