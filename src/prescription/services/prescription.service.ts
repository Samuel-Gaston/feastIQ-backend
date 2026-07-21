import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Prescription } from "../schemas/prescriptions.schema";
import { Patient } from "../../patient/schemas/patient.schema";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { Appointment } from "../../appointment/schemas/appointment.schema";
import { CreatePrescriptionDTO, UpdatePrescriptionDTO } from "../dtos/create-prescription.dto";
  
@Injectable()
export class PrescriptionService {
  constructor(
    @InjectModel(Prescription.name)
    private readonly prescriptionModel: Model<Prescription>,
    @InjectModel(Patient.name)
    private readonly patientModel: Model<Patient>,
    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<Doctor>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
  ) {}

  // ─── Create prescription ─────────────────────────────────────────
  async createPrescription(dto: CreatePrescriptionDTO): Promise<Prescription> {
    const { patient, doctor, appointment, notes, issuedAt, expiresAt } = dto;

    const existPatient = await this.patientModel.findById(patient);
    if (!existPatient) {
      throw new NotFoundException("Patient not found");
    }

    const existDoctor = await this.doctorModel.findById(doctor);
    if (!existDoctor) {
      throw new NotFoundException("Doctor not found");
    }

    if (appointment) {
      const existAppointment = await this.appointmentModel.findById(appointment);
      if (!existAppointment) {
        throw new NotFoundException("Appointment not found");
      }
    }

    const prescription = await this.prescriptionModel.create({
      patient: new Types.ObjectId(patient),
      doctor: new Types.ObjectId(doctor),
      appointment: appointment ? new Types.ObjectId(appointment) : undefined,
      notes,
      issuedAt,
      expiresAt,
    });

    await prescription.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email specialization' },
      { path: 'appointment', select: 'scheduledAt consultationType reason' },
    ]);

    return prescription;
  }

  // ─── Get all prescriptions (admin) ──────────────────────────────
  async getAllPrescriptions(): Promise<Prescription[]> {
    return this.prescriptionModel
      .find()
      .populate({ path: 'patient', select: 'name email phone' })
      .populate({ path: 'doctor', select: 'name email specialization' })
      .populate({ path: 'appointment', select: 'scheduledAt consultationType reason' })
      .sort({ createdAt: -1 });
  }

  
  async getMyPrescriptions(userId: string): Promise<Prescription[]> {
  // userId from JWT is User._id — find Patient document first
  const patient = await this.patientModel.findOne({ user: new Types.ObjectId(userId) });
  if (!patient) {
    throw new NotFoundException('Patient profile not found');
  }

  return this.prescriptionModel
    .find({ patient: patient._id })
    .populate({ path: 'doctor', select: 'name email specialization licenseNumber' })
    .populate({
      path: 'appointment',
      select: 'scheduledAt consultationType reason status',
    })
    .sort({ createdAt: -1 });
}

  // ─── Get all prescriptions for a patient ────────────────────────
  async getAllPatientPrescritions(patientId: string): Promise<Prescription[]> {
    const patient = await this.patientModel.findById(patientId);
    if (!patient) throw new NotFoundException("Patient not found");

    return this.prescriptionModel
      .find({ patient: new Types.ObjectId(patientId) })
      .populate({ path: 'doctor', select: 'name email specialization' })
      .populate({ path: 'appointment', select: 'scheduledAt consultationType reason' })
      .sort({ createdAt: -1 });
  }


  async getMyDoctorPrescriptions(userId: string): Promise<Prescription[]> {
  // userId from JWT is User._id — find Doctor document first
  const doctor = await this.doctorModel.findOne({ user: new Types.ObjectId(userId) });
  if (!doctor) {
    throw new NotFoundException('Doctor profile not found');
  }

  return this.prescriptionModel
    .find({ doctor: doctor._id })
    .populate({ path: 'patient', select: 'name email phone' })
    .populate({ path: 'appointment', select: 'scheduledAt consultationType reason' })
    .sort({ createdAt: -1 });
}

  // ─── Get single prescription ─────────────────────────────────────
  async getPrescription(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionModel
      .findById(id)
      .populate({ path: 'patient', select: 'name email phone address' })
      .populate({ path: 'doctor', select: 'name email specialization licenseNumber' })
      .populate({ path: 'appointment', select: 'scheduledAt consultationType reason status' });

    if (!prescription) throw new NotFoundException("Prescription not found");
    return prescription;
  }

  // ─── Update prescription ─────────────────────────────────────────
  async UpdatePrescription(id: string, dto: UpdatePrescriptionDTO): Promise<Prescription> {
    const existPrescription = await this.prescriptionModel.findById(id);
    if (!existPrescription) throw new NotFoundException("Prescription not found");

    const updateData: any = {};
    if (dto.notes !== undefined)     updateData.notes = dto.notes;
    if (dto.expiresAt !== undefined) updateData.expiresAt = dto.expiresAt;

    const updated = await this.prescriptionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate({ path: 'patient', select: 'name email phone' })
      .populate({ path: 'doctor', select: 'name email specialization' })
      .populate({ path: 'appointment', select: 'scheduledAt consultationType reason' });

    if (!updated) {
      throw new HttpException("Failed to update prescription", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return updated;
  }

  // ─── Delete prescription ─────────────────────────────────────────
  async DeletePrescription(id: string): Promise<Prescription> {
    const existPrescription = await this.prescriptionModel.findById(id);
    if (!existPrescription) throw new NotFoundException("Prescription not found");

    const deleted = await this.prescriptionModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new HttpException("Failed to delete prescription", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return deleted;
  }
}