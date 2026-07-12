import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment } from '../schemas/appointment.schema';
import { Patient } from '../../patient/schemas/patient.schema';
import { Doctor } from '../../doctor/schemas/doctor.schema';
import { CreateAppointmentDTO } from '../dtos/create-appointment.dto';
import { UpdateAppointmentStatusDTO } from '../dtos/update-appointment-status.dto';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Patient.name)
    private readonly patientModel: Model<Patient>,
    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<Doctor>,
  ) {}

  // ─── PATIENT: Book a new appointment ────────────────────────────
  async createAppointment(dto: CreateAppointmentDTO): Promise<Appointment> {
    const { patient, doctor, scheduledAt, consultationType, reason, notes } = dto;

    const existingPatient = await this.patientModel.findById(patient);
    if (!existingPatient) {
      throw new NotFoundException('Patient not found');
    }

    const existingDoctor = await this.doctorModel.findById(doctor);
    if (!existingDoctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Prevent booking in the past
    if (scheduledAt && new Date(scheduledAt) < new Date()) {
      throw new BadRequestException('Cannot book an appointment in the past');
    }

    const appointment = await this.appointmentModel.create({
      patient: new Types.ObjectId(patient),
      doctor: new Types.ObjectId(doctor),
      scheduledAt,
      consultationType,
      reason,
      notes,
      status: AppointmentStatus.PENDING,
    });

    await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email specialization' },
    ]);

    return appointment;
  }

  // ─── ADMIN/DOCTOR: Get all appointments ─────────────────────────
  async getAllAppointments(): Promise<Appointment[]> {
    return this.appointmentModel
      .find()
      .populate({ path: 'patient', select: 'name email phone' })
      .populate({ path: 'doctor', select: 'name email specialization' })
      .sort({ scheduledAt: -1 });
  }

  // ─── Get one appointment by ID ───────────────────────────────────
  async getOneAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate({ path: 'patient', select: 'name email phone address' })
      .populate({ path: 'doctor', select: 'name email specialization licenseNumber' });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  // ─── PATIENT: Get my appointments (by patient user _id) ─────────
  async getPatientAppointments(userId: string): Promise<Appointment[]> {
    // userId from JWT is User._id — find the Patient document first
    const patient = await this.patientModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return this.appointmentModel
      .find({ patient: patient._id })
      .populate({ path: 'doctor', select: 'name email specialization' })
      .sort({ scheduledAt: -1 });
  }

  // ─── DOCTOR: Get my appointments (by doctor user _id) ───────────
  async getDoctorAppointments(userId: string): Promise<Appointment[]> {
    const doctor = await this.doctorModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.appointmentModel
      .find({ doctor: doctor._id })
      .populate({ path: 'patient', select: 'name email phone' })
      .sort({ scheduledAt: -1 });
  }

  // ─── DOCTOR: Confirm appointment ─────────────────────────────────
  async confirmAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.status !== AppointmentStatus.PENDING && appointment.status !== AppointmentStatus.RESCHEDULED) {
      throw new BadRequestException(`Cannot confirm an appointment with status: ${appointment.status}`);
    }

    appointment.status = AppointmentStatus.CONFIRMED;
    appointment.statusReason = undefined;
    await appointment.save();

    await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email specialization' },
    ]);

    return appointment;
  }

  // ─── DOCTOR: Reschedule appointment (propose new time) ───────────
  async rescheduleAppointment(id: string, dto: UpdateAppointmentStatusDTO): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.status === AppointmentStatus.COMPLETED || appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(`Cannot reschedule an appointment with status: ${appointment.status}`);
    }

    if (!dto.newScheduledAt) {
      throw new BadRequestException('A new scheduled date is required to reschedule');
    }

    if (new Date(dto.newScheduledAt) < new Date()) {
      throw new BadRequestException('Proposed time cannot be in the past');
    }

    appointment.status = AppointmentStatus.RESCHEDULED;
    appointment.proposedTime = new Date(dto.newScheduledAt);
    appointment.statusReason = dto.reason;
    await appointment.save();

    await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email specialization' },
    ]);

    return appointment;
  }

  // ─── DOCTOR: Mark appointment as completed ───────────────────────
  async completeAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException(`Cannot complete an appointment with status: ${appointment.status}. It must be CONFIRMED first.`);
    }

    appointment.status = AppointmentStatus.COMPLETED;
    appointment.completedAt = new Date();
    await appointment.save();

    await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email specialization' },
    ]);

    return appointment;
  }

  // ─── PATIENT/DOCTOR/ADMIN: Cancel appointment ────────────────────
  async cancelAppointment(id: string, dto: UpdateAppointmentStatusDTO): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.status === AppointmentStatus.COMPLETED || appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(`Cannot cancel an appointment with status: ${appointment.status}`);
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.statusReason = dto.reason;
    await appointment.save();

    await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email specialization' },
    ]);

    return appointment;
  }

  // ─── ADMIN: Update any appointment field ─────────────────────────
  async updateAppointment(id: string, dto: UpdateAppointmentStatusDTO): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

    const updateData: any = {};
    if (dto.status) updateData.status = dto.status;
    if (dto.reason) updateData.statusReason = dto.reason;
    if (dto.newScheduledAt) updateData.scheduledAt = dto.newScheduledAt;

    const updated = await this.appointmentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate({ path: 'patient', select: 'name email phone' })
      .populate({ path: 'doctor', select: 'name email specialization' });

    if (!updated) throw new NotFoundException('Appointment not found');
    return updated;
  }

  // ─── ADMIN: Delete appointment ───────────────────────────────────
  async deleteAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

    const deleted = await this.appointmentModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new HttpException('Failed to delete appointment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return deleted;
  }

  // ─── ADMIN: Get appointments by status ───────────────────────────
  async getAppointmentsByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    return this.appointmentModel
      .find({ status })
      .populate({ path: 'patient', select: 'name email phone' })
      .populate({ path: 'doctor', select: 'name email specialization' })
      .sort({ scheduledAt: -1 });
  }
}
