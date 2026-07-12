import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Patient } from "../../patient/schemas/patient.schema";
import { Model } from "mongoose";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { Appointment } from "../../appointment/schemas/appointment.schema";
import { CreatePrescriptionDTO } from "../dtos/create-prescription.dto";
import { Prescription } from "../schemas/prescriptions.schema";
import { Medication } from "../../medications/schemas/medication.schema";
import { UpdatePrescriptionDTO } from "../dtos/create-prescription.dto";
import {Types} from 'mongoose'

@Injectable()
export class PrescriptionService{
    constructor(
    @InjectModel(Prescription.name)
    private readonly prescriptionModel: Model<Prescription>,

    @InjectModel(Patient.name)
    private readonly patientModel: Model<Patient>,

    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<Doctor>,

    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,

    @InjectModel(Medication.name)
    private readonly medicationModel: Model<Medication>,
    ){}

async createPrescription(dto: CreatePrescriptionDTO): Promise<Prescription> {
  const { patient, doctor, appointment, medications, notes, issuedAt, expiresAt } = dto;

  const existPatient = await this.patientModel.findById(patient);
  if (!existPatient) {
    throw new HttpException("Patient not found", HttpStatus.NOT_FOUND);
  }

  const existDoctor = await this.doctorModel.findById(doctor);
  if (!existDoctor) {
    throw new HttpException("Doctor not found", HttpStatus.NOT_FOUND);
  }

  let medicationObjectIds: Types.ObjectId[] = [];
  if (medications && medications.length > 0) {

    const existingMeds = await this.medicationModel.find({
      _id: { $in: medications.map(id => new Types.ObjectId(id)) }
    });
    if (existingMeds.length !== medications.length) {
      throw new HttpException("One or more medications not found", HttpStatus.NOT_FOUND);
    }
    medicationObjectIds = existingMeds.map(m => m._id as Types.ObjectId);
  }

  const prescription = await this.prescriptionModel.create({
    patient: new Types.ObjectId(patient),
    doctor: new Types.ObjectId(doctor),
    appointment: appointment ? new Types.ObjectId(appointment) : undefined,
    medications: medicationObjectIds, // ← array, not single
    notes,
    issuedAt,
    expiresAt,
  });

  await prescription.populate([
    { path: 'patient', select: 'name email phone' },
    { path: 'doctor', select: 'name email specialization' },
    { path: 'medications', select: 'name dosage form' },
    { path: 'appointment', select: 'scheduledAt consultationType' },
  ]);

  return prescription;
}


    async getAllPatientPrescritions(patientId:string): Promise<Prescription[]>{
        const patient = await this.patientModel.findById(patientId)
        if(!patient){
            throw new HttpException("Patient not found", HttpStatus.NOT_FOUND)
        }
        const prescriptions = await this.prescriptionModel.find().populate({path:'patient'}).populate( {path:'doctor'})
        return prescriptions;
    }

    async getPrescription(id:string): Promise<Prescription>{
        const prescription = await this.prescriptionModel.findById(id)
        if(!prescription){
            throw new HttpException("Prescription not found", HttpStatus.NOT_FOUND)
        }
        return prescription;
    }

     async getAllPrescriptions(): Promise<Prescription[]>{
        const prescription = await this.prescriptionModel.find().populate({path: 'patient'}).populate({path:'doctor'})
        if(!prescription){
            throw new HttpException("Prescription not found", HttpStatus.NOT_FOUND)
        }
        return prescription;
    }

       async DeletePrescription(id:string): Promise<Prescription>{
        const existPrescription = await this.prescriptionModel.findById(id)
        if(!existPrescription){
            throw new HttpException("Prescription not found", HttpStatus.NOT_FOUND)
        }
        const prescription = await this.prescriptionModel.findByIdAndDelete(id)
        if(!prescription){
            throw new HttpException("failed to delete Prescription", HttpStatus.INTERNAL_SERVER_ERROR) 
        }
        return prescription;
    }


   async UpdatePrescription(id: string, dto: UpdatePrescriptionDTO): Promise<Prescription> {
  const existPrescription = await this.prescriptionModel.findById(id);
  if (!existPrescription) {
    throw new HttpException("Prescription not found", HttpStatus.NOT_FOUND);
  }

  const updateData: any = {};
  if (dto.notes !== undefined) updateData.notes = dto.notes;
  if (dto.expiresAt !== undefined) updateData.expiresAt = dto.expiresAt;
  if (dto.medications && dto.medications.length > 0) {
    updateData.medications = dto.medications.map(id => new Types.ObjectId(id));
  }

  const updated = await this.prescriptionModel.findByIdAndUpdate(
    id, updateData, { new: true }
  ).populate([
    { path: 'patient', select: 'name email phone' },
    { path: 'doctor', select: 'name email specialization' },
    { path: 'medications', select: 'name dosage form' },
    { path: 'appointment', select: 'scheduledAt consultationType' },
  ]);

  if (!updated) {
    throw new HttpException("Failed to update prescription", HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return updated;
}



}