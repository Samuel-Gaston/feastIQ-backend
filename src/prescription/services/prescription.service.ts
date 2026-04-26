import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Patient } from "../../patient/schemas/patient.schema";
import { Model } from "mongoose";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { Appointment } from "../../appointment/schemas/appointment.schema";
import { CreatePrescriptionDTO } from "../dtos/create-prescription.dto";
import { Prescription } from "../schemas/prescriptions.schema";
import { Medication } from "../../medications/schemas/medication.schema";



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

    async createPrescription(dto: CreatePrescriptionDTO): Promise<Prescription>{
        const {issuedAt, expiresAt} = dto;
    
        const existPatient = await this.patientModel.findById(dto.patient)
        if(!existPatient){
         throw new HttpException("Patient not found", HttpStatus.NOT_FOUND)
        }

        const existDoctor = await this.doctorModel.findById(dto.doctor)
        if(!existDoctor){
            throw new HttpException("Doctor not found", HttpStatus.NOT_FOUND)
        }

        const existAppointment = await this.appointmentModel.findById(dto.appointment)
        if(!existAppointment){
            throw new HttpException("Appointment not found", HttpStatus.NOT_FOUND)
        }

          const existMedication = await this.medicationModel.findById(dto.medication)
        if(!existMedication){
            throw new HttpException("Medication not found", HttpStatus.NOT_FOUND)
        }

        const prescription = await this.prescriptionModel.create({
            patient: existPatient._id,
            doctor: existDoctor._id,
            appointment: existAppointment._id,
            medications: existMedication._id,
            issuedAt,
            expiresAt
        })
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


     async UpdatePrescription(id:string): Promise<Prescription>{
        const existPrescription = await this.prescriptionModel.findById(id)
        if(!existPrescription){
            throw new HttpException("Prescription not found", HttpStatus.NOT_FOUND)
        }
        const prescription = await this.prescriptionModel.findByIdAndUpdate(id)
        if(!prescription){
            throw new HttpException("failed to update Prescription", HttpStatus.INTERNAL_SERVER_ERROR) 
        }
        return prescription;
    }



}