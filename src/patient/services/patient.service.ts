import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Patient } from "../schemas/patient.schema";
import { Role } from "../../roles/schemas/role.schema";
import { Model } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { CreatePatientDTO } from "../dtos/create-patient.dto";
import { RoleEnum } from "../../common/enums/role.enum";
import * as bcrypt from 'bcryptjs'
import { UpdatePatientDTO } from "../dtos/update-patient.dto";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { MailService } from "../../common/mail/mail.service";
import {Types} from "mongoose"
import { NotificationService } from "../../notification/services/notification.service";

@Injectable()
export class PatientService{
    constructor(
        @InjectModel(Patient.name)
        private readonly patientModel: Model<Patient>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>,

        @InjectModel(User.name)
        private readonly userModel: Model<User>,

        @InjectModel(Doctor.name)
        private readonly doctorModel: Model<Doctor>,

         private readonly mailService: MailService,
         private readonly notificationService: NotificationService
    ){}


async createPatient(dto: CreatePatientDTO) {
  const { name, email, address, phone, password } = dto;

  const existingEmail = await this.patientModel.findOne({ email });
  if (existingEmail) {
    throw new HttpException("Patient with this email already exists", HttpStatus.CONFLICT);
  }
  if (!password) {
    throw new HttpException("Password is required", HttpStatus.BAD_REQUEST);
  }

  const patientRole = await this.roleModel.findOne({ name: RoleEnum.PATIENT });
  if (!patientRole) {
    throw new HttpException("Patient role not found", HttpStatus.NOT_FOUND);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await this.userModel.create({
    name,
    email,
    password: hashedPassword,
    isVerified: true,
    isActive: true,
    roles: patientRole._id,
  });

  const patient = await this.patientModel.create({
    name,
    email,
    address,
    phone,
    user: user._id,
  });

  await patient.populate({ path: 'user', populate: { path: 'roles' } });

  await this.mailService.sendPatientWelcomeEmail({
    to: email!,
    name: name!,
    email: email!,
    password,
  });

  return patient;
}
    

     async getAllPatients(): Promise<Patient[]>{
        const Patients = await this.patientModel.find().populate({path:'user'}).populate({path:'role'}).populate('doctor', 'name');
        return Patients;
    }
        
        
    async getPatientById(id:string): Promise<Patient>{
        const Patient = await this.patientModel.findById(id).populate({path:'user'}).populate({path:'role'}).populate('doctor', 'name');
        if(!Patient){
            throw new HttpException("Patient not found", HttpStatus.NOT_FOUND)
        }
        return Patient;
    }
  

    
async updatePatient(id: string, dto: any): Promise<Patient> {
  const existPatient = await this.patientModel.findById(id);
  if (!existPatient) {
    throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
  }
 
  const updateData: any = {};
  if (dto.name)    updateData.name = dto.name;
  if (dto.email)   updateData.email = dto.email;
  if (dto.phone)   updateData.phone = dto.phone;
  if (dto.address) updateData.address = dto.address;
 
  const patient = await this.patientModel.findByIdAndUpdate(
    id, updateData, { new: true }
  ).populate({ path: 'user', populate: { path: 'roles' } });
 
  if (!patient) {
    throw new HttpException('Failed to update patient', HttpStatus.INTERNAL_SERVER_ERROR);
  }
 
  // STEP 2: Sync User — use the patient's linked user._id
  const userUpdateData: any = {};
  if (dto.name)  userUpdateData.name = dto.name;
  if (dto.email) userUpdateData.email = dto.email;
 
  if (Object.keys(userUpdateData).length > 0 && existPatient.user) {
    await this.userModel.findByIdAndUpdate(existPatient.user.toString(), userUpdateData);
  }
 
  return patient;
}


    async deletePatient(id:string): Promise<void>{
           const existPatient = await this.patientModel.findById(id)
        if(!existPatient){
            throw new HttpException("Patient not found", HttpStatus.NOT_FOUND)
        }
        const Patient = await this.patientModel.findByIdAndDelete(id);
        if(!Patient){
            throw new HttpException("failed to delet patient", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    
      async findPatientProfile(userId: string): Promise<Patient> {
       const patient = await this.patientModel
      .findOne({ user: new Types.ObjectId(userId) })
       .populate('user') 
    .populate('roles'); 
     
      if (!patient) {
      throw new HttpException('Patient profile not found', HttpStatus.NOT_FOUND);
      }
      

      return patient;
    }

async updatePatientProfile(id: string, dto: any): Promise<Patient> {
  // 1. Find the existing patient linked to the user
  const existPatient = await this.patientModel
    .findOne({ user: new Types.ObjectId(id) })
    .exec();

  if (!existPatient) {
    throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
  }

  // 2. Prepare User update (Source of Truth)
  const userUpdateData: any = {};
  if (dto.name) userUpdateData.name = dto.name;
  if (dto.email) userUpdateData.email = dto.email;
  if (dto.password) {
    userUpdateData.password = await bcrypt.hash(dto.password, 10);
  }

  if (Object.keys(userUpdateData).length > 0) {
    await this.userModel.findByIdAndUpdate(id, userUpdateData).exec();
  }

  // 3. Prepare and Update Patient document
  const updateData = { ...dto };
  delete updateData.email; // Email usually lives in the User schema
  
  const patient = await this.patientModel
    .findByIdAndUpdate(existPatient._id, updateData, { new: true })
    .populate({ path: 'user', populate: { path: 'roles' } })
    .populate({path: 'patient'})
    .exec();

  if (!patient) {
    throw new HttpException('Failed to update Patient profile', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  // 4. Return as plain object cast to Patient
  return patient.toObject() as Patient;
}
 

    
     
    async LinkPatientToDoctor(patientId:string, doctorId:string): Promise<Patient>{
        const patient = await this.patientModel.findById({_id:patientId});
        if(!patient){
            throw new HttpException("Patient not found", HttpStatus.NOT_FOUND)
        }
        const doctor = await this.doctorModel.findById({_id:doctorId});
        if(!doctor){
            throw new HttpException("Doctor not found", HttpStatus.NOT_FOUND)
        }
        patient.doctor = doctor._id as any;
        await patient.save();
        await patient.populate({path:'doctor'});
        await this.notificationService.saveNotification({
   title: "New Patient Assigned",
  message: `A new patient, ${patient.name}, has been assigned to your care.`,
    userId: doctorId, 
  });
        return patient;
     }

     async getMyAssignedDoctor(userId: string): Promise<Doctor> {
  const patient = await this.patientModel
    .findOne({ user: new Types.ObjectId(userId) })
    .populate('doctor') // Populates doctor details
    .exec();

  if (!patient) {
    throw new HttpException('Patient profile not found', HttpStatus.NOT_FOUND);
  }

  if (!patient.doctor) {
    throw new HttpException('No doctor assigned to this patient', HttpStatus.NOT_FOUND);
  }

  return patient.doctor as unknown as Doctor;
}

}