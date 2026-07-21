import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Medication } from "../schemas/medication.schema";
import { Prescription } from "../../prescription/schemas/prescriptions.schema";
import { Model, Types } from "mongoose";
import { CreateMedicationDTO, UpdateMedicationDTO } from "../dtos/create-medication.dto";


@Injectable()
export class MedicationService {
  constructor(
    @InjectModel(Medication.name)
    private readonly medicationModel: Model<Medication>,
    @InjectModel(Prescription.name)
    private readonly prescriptionModel: Model<Prescription>,
  ) {}

  // ─── Create a medication under a prescription ──────────────────
  async createMedication(dto: CreateMedicationDTO): Promise<Medication> {
    const { prescription, name, dosage, instruction, frequency, startDate, endDate, schedule, duration } = dto;

    if (!name) {
      throw new HttpException("Medication name is required", HttpStatus.BAD_REQUEST);
    }

    const existPrescription = await this.prescriptionModel.findById(prescription);
    if (!existPrescription) {
      throw new NotFoundException("Prescription not found — create a prescription first before adding medications");
    }

    const medication = await this.medicationModel.create({
      prescription: new Types.ObjectId(prescription),
      name,
      dosage,
      instruction,
      frequency,
      duration,
      startDate,
      endDate,
      schedule,
    });

    // Populate prescription with patient and doctor so frontend has full context
    await medication.populate({
      path: 'prescription',
      populate: [
        { path: 'patient', select: 'name email phone' },
        { path: 'doctor', select: 'name email specialization' },
      ],
    });

    return medication;
  }

  // ─── Get all medications for a specific prescription ──────────
  async getMedicationsByPrescription(prescriptionId: string): Promise<Medication[]> {
    const existPrescription = await this.prescriptionModel.findById(prescriptionId);
    if (!existPrescription) throw new NotFoundException("Prescription not found");

    return this.medicationModel
      .find({ prescription: new Types.ObjectId(prescriptionId) })
      .populate({
        path: 'prescription',
        populate: [
          { path: 'patient', select: 'name email phone' },
          { path: 'doctor', select: 'name email specialization' },
        ],
      })
      .sort({ createdAt: -1 });
  }

  // ─── Get all medications (admin/doctor view) ──────────────────
  async getAllMedication(): Promise<Medication[]> {
    return this.medicationModel
      .find()
      .populate({
        path: 'prescription',
        populate: [
          { path: 'patient', select: 'name email' },
          { path: 'doctor', select: 'name email specialization' },
        ],
      })
      .sort({ createdAt: -1 });
  }


  async getMyDoctorMedications(userId: string): Promise<Medication[]> {
  // Step 1: find the Doctor document from User._id
  const doctor = await this.prescriptionModel
    .db.model('Doctor')
    .findOne({ user: new Types.ObjectId(userId) })
    .lean();

  if (!doctor) {
    throw new NotFoundException('Doctor profile not found');
  }

  // Step 2: find all prescriptions created by this doctor
  const prescriptions = await this.prescriptionModel
    .find({ doctor: (doctor as any)._id })
    .select('_id')
    .lean();

  if (!prescriptions || prescriptions.length === 0) return [];

  const prescriptionIds = prescriptions.map(p => p._id);

  // Step 3: find all medications linked to those prescriptions
  return this.medicationModel
    .find({ prescription: { $in: prescriptionIds } })
    .populate({
      path: 'prescription',
      populate: [
        { path: 'patient', select: 'name email phone' },
        { path: 'doctor', select: 'name email specialization' },
      ],
    })
    .sort({ createdAt: -1 });
}




async getMyMedications(userId: string): Promise<Medication[]> {
  // Step 1: find the Patient document from User._id
  const patient = await this.prescriptionModel
    .db.model('Patient')
    .findOne({ user: new Types.ObjectId(userId) })
    .lean();

  if (!patient) {
    throw new NotFoundException('Patient profile not found');
  }

  // Step 2: find all prescriptions belonging to this patient
  const prescriptions = await this.prescriptionModel
    .find({ patient: (patient as any)._id })
    .select('_id')
    .lean();

  if (!prescriptions || prescriptions.length === 0) return [];

  const prescriptionIds = prescriptions.map(p => p._id);

  // Step 3: find all medications linked to those prescriptions
  return this.medicationModel
    .find({ prescription: { $in: prescriptionIds } })
    .populate({
      path: 'prescription',
      select: 'notes issuedAt expiresAt',
      populate: [
        { path: 'doctor', select: 'name email specialization' },
        { path: 'appointment', select: 'scheduledAt consultationType reason' },
      ],
    })
    .sort({ createdAt: -1 });
}


  // ─── Get single medication ─────────────────────────────────────
  async getMedication(id: string): Promise<Medication> {
    const medication = await this.medicationModel
      .findById(id)
      .populate({
        path: 'prescription',
        populate: [
          { path: 'patient', select: 'name email phone' },
          { path: 'doctor', select: 'name email specialization' },
          { path: 'appointment', select: 'scheduledAt consultationType reason' },
        ],
      });

    if (!medication) throw new NotFoundException("Medication not found");
    return medication;
  }

  // ─── Update medication ─────────────────────────────────────────
  async updateMedication(id: string, dto: UpdateMedicationDTO): Promise<Medication> {
    const existMedication = await this.medicationModel.findById(id);
    if (!existMedication) throw new NotFoundException("Medication not found");

    const updateData: any = {};
    if (dto.name)        updateData.name = dto.name;
    if (dto.dosage)      updateData.dosage = dto.dosage;
    if (dto.frequency)   updateData.frequency = dto.frequency;
    if (dto.schedule)    updateData.schedule = dto.schedule;
    if (dto.duration)    updateData.duration = dto.duration;
    if (dto.instruction) updateData.instruction = dto.instruction;
    if (dto.startDate)   updateData.startDate = dto.startDate;
    if (dto.endDate)     updateData.endDate = dto.endDate;

    const updated = await this.medicationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: 'prescription',
        populate: [
          { path: 'patient', select: 'name email' },
          { path: 'doctor', select: 'name email specialization' },
        ],
      });

    if (!updated) throw new HttpException("Failed to update medication", HttpStatus.INTERNAL_SERVER_ERROR);
    return updated;
  }

  // ─── Delete medication ─────────────────────────────────────────
  async deleteMedication(id: string): Promise<Medication> {
    const existMedication = await this.medicationModel.findById(id);
    if (!existMedication) throw new NotFoundException("Medication not found");

    const deleted = await this.medicationModel.findByIdAndDelete(id);
    if (!deleted) throw new HttpException("Failed to delete medication", HttpStatus.INTERNAL_SERVER_ERROR);
    return deleted;
  }
}