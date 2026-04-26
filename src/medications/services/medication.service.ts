import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Medication } from "../schemas/medication.schema";
import { Model } from "mongoose";
import { Prescription } from "../../prescription/schemas/prescriptions.schema";
import { CreateMedicationDTO } from "../dtos/create-medication.dto";





@Injectable()
export class MedicationService{
    constructor(
        @InjectModel(Medication.name)
        private readonly medicationModel: Model<Medication>,

        @InjectModel(Prescription.name)
        private readonly prescriptionModel: Model<Prescription>
    ){}


    async createMedication(dto: CreateMedicationDTO): Promise<Medication>{
     const {name, dosage, instruction, frequency, startDate, endDate, schedule, duration} = dto;


     const existPrescription = await this.prescriptionModel.findById(dto.prescription)
     if(!existPrescription){
         throw new HttpException("Prescription not found for this medication", HttpStatus.NOT_FOUND)
     }

     const medication = await this.medicationModel.create({
        prescription: existPrescription._id,
        name,
        dosage,
        instruction,
        frequency,
        duration,
        startDate, 
        endDate,
        schedule
     })

     return medication;

    }


    async getAllMedication():Promise<Medication[]>{
        const medication = await this.medicationModel.find().populate({path:'prescription'})
        if(!medication){
            throw new HttpException("Medications not found", HttpStatus.NOT_FOUND)
        }
        return medication;
    }


    async getMedication(id:string): Promise<Medication>{
     const medication = await this.medicationModel.findById(id)
     if(!medication){
        throw new HttpException("this is medication can not be found", HttpStatus.NOT_FOUND)
     }
        return medication;
    }


    async deleteMedication(id:string): Promise<void>{
        const existMedication = await this.medicationModel.findById(id)
         if(!existMedication){
            throw new HttpException("Medication not found", HttpStatus.NOT_FOUND)
         }
        const medication = await this.medicationModel.findByIdAndDelete(id)
        if(!medication){
            throw new HttpException("Failed to delete medication", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


    async updateMedication(id:string, dto:CreateMedicationDTO): Promise<Medication>{
        const existMedication = await this.medicationModel.findById(id)
        if(!existMedication){
            throw new HttpException("Medication not found", HttpStatus.NOT_FOUND)
        }
        const medication = await this.medicationModel.findByIdAndUpdate(id, dto, {new:true})
        if(!medication){
            throw new HttpException("Failed to update medication", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        return medication;
    }




}