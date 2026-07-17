import { Injectable, HttpException, HttpStatus, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Consultation } from "../schema/consultation.schema";
import { Appointment } from "../../appointment/schemas/appointment.schema";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { CreateConsultationDTO } from "../dtos/create-consultation.dto";
import { AppointmentStatus } from "../../common/enums/appointment-status.enum";
import { Patient } from "../../patient/schemas/patient.schema";

@Injectable()
export class ConsultationService {
  constructor(
    @InjectModel(Consultation.name) private readonly consultationModel: Model<Consultation>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
        @InjectModel(Patient.name) private readonly patientModel: Model<Patient>, 
  ) {}

  // ─── DOCTOR: Create a consultation after a completed/confirmed appointment ──
  async create(userId: string, dto: CreateConsultationDTO): Promise<Consultation> {
    // userId from JWT is User._id — look up the actual Doctor document
    const doctor = await this.doctorModel.findOne({ user: new Types.ObjectId(userId) });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found for this user');
    }

    const appointment = await this.appointmentModel.findById(dto.appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Only allow consultation on CONFIRMED or COMPLETED appointments
    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot create a consultation for an appointment with status: ${appointment.status}. It must be CONFIRMED or COMPLETED.`
      );
    }

    // Prevent duplicate consultations for the same appointment
    const existing = await this.consultationModel.findOne({ appointment: appointment._id });
    if (existing) {
      throw new BadRequestException('A consultation already exists for this appointment.');
    }

    // Verify the appointment belongs to this doctor
    if (appointment.doctor?.toString() !== doctor._id.toString()) {
      throw new BadRequestException('This appointment does not belong to you.');
    }

    const consultation = await this.consultationModel.create({
      appointment: appointment._id,
      patient: appointment.patient,
      doctor: doctor._id,
      diagnosis: dto.diagnosis,
      treatmentPlan: dto.treatmentPlan,
      clinicalNotes: dto.clinicalNotes,
    });

    // Mark appointment as COMPLETED and link the consultation back to it
    await this.appointmentModel.findByIdAndUpdate(dto.appointmentId, {
      status: AppointmentStatus.COMPLETED,
      completedAt: new Date(),
      consultation: consultation._id,
    });

    await consultation.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email specialization' },
      { path: 'appointment', select: 'scheduledAt consultationType reason' },
    ]);

    return consultation;
  }

  // ─── DOCTOR: Get all my own consultations ────────────────────────
  async getDoctorConsultations(userId: string): Promise<Consultation[]> {
    const doctor = await this.doctorModel.findOne({ user: new Types.ObjectId(userId) });
    if (!doctor) throw new NotFoundException('Doctor profile not found');


    return this.consultationModel
      .find({ doctor: doctor._id })
      .populate({ path: 'patient', select: 'name email phone address' })
      .populate({ path: 'appointment', select: 'scheduledAt consultationType reason status' })
      .sort({ createdAt: -1 });
  }


async getPatientConsultationsByUserId(userId: string): Promise<Consultation[]> {
  // userId from JWT is User._id — look up the Patient document first
  const patient = await this.patientModel.findOne({ user: new Types.ObjectId(userId) });
  if (!patient) {
    throw new NotFoundException('Patient profile not found');
  }

  return this.consultationModel
    .find({ patient: patient._id })
    .populate({ path: 'doctor', select: 'name email specialization licenseNumber' })
    .populate({
      path: 'appointment',
      select: 'scheduledAt consultationType reason status completedAt',
    })
    .sort({ createdAt: -1 });
}



  // ─── DOCTOR/ADMIN: Get consultation history for a specific patient ──
  async getPatientHistory(patientId: string): Promise<Consultation[]> {
    const history = await this.consultationModel
      .find({ patient: new Types.ObjectId(patientId) })
      .populate({ path: 'doctor', select: 'name email specialization' })
      .populate({ path: 'patient', select: 'name email phone' })
      .populate({ path: 'appointment', select: 'scheduledAt consultationType reason status' })
      .sort({ createdAt: -1 });

    return history;
  }

  // ─── Get one consultation by ID ──────────────────────────────────
  async getOne(id: string): Promise<Consultation> {
    const consultation = await this.consultationModel
      .findById(id)
      .populate({ path: 'patient', select: 'name email phone address' })
      .populate({ path: 'doctor', select: 'name email specialization licenseNumber' })
      .populate({ path: 'appointment', select: 'scheduledAt consultationType reason status' });

    if (!consultation) throw new NotFoundException('Consultation not found');
    return consultation;
  }

  // ─── ADMIN: Get all consultations ────────────────────────────────
  async getAll(): Promise<Consultation[]> {
    return this.consultationModel
      .find()
      .populate({ path: 'patient', select: 'name email phone' })
      .populate({ path: 'doctor', select: 'name email specialization' })
      .populate({ path: 'appointment', select: 'scheduledAt consultationType reason status' })
      .sort({ createdAt: -1 });
  }
}
