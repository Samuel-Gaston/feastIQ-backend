import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Doctor } from "../schemas/doctor.schema";
import { Model, Types } from "mongoose";
import { CreateDoctorDto } from "../dtos/create-doctor.dto";
import { Role } from "../../roles/schemas/role.schema";
import { RoleEnum } from "../../common/enums/role.enum";
import * as bcrypt from 'bcryptjs';
import { User } from "../../user/schemas/user.schema";
import { UpdateDoctorDto } from "../dtos/update-doctor.dto";
import { Patient } from "../../patient/schemas/patient.schema";
import { MailService } from "../../common/mail/mail.service";
import { NotificationService } from "../../notification/services/notification.service";
import { InjectConnection } from '@nestjs/mongoose';
import {  Connection } from 'mongoose';

@Injectable()
export class DoctorService{
    constructor(
        @InjectModel(Doctor.name)
        private readonly doctorModel: Model<Doctor>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>,

        @InjectModel(User.name)
        private readonly userModel: Model<User>,

        @InjectModel(Patient.name)
        private readonly patientModel: Model<Patient>,

          private readonly mailService: MailService, 

          private readonly notificationService: NotificationService,

          @InjectConnection() private connection: Connection,
    ){}


  async createDoctor(dto: CreateDoctorDto) {
    const { name, email, phone, address, country, specialization, licenseNumber, password } = dto;

    const existingDoctor = await this.doctorModel.findOne({ email });
    if (existingDoctor) {
      throw new HttpException("A doctor already exist with email", HttpStatus.CONFLICT);
    }

    const existingLicense = await this.doctorModel.findOne({ licenseNumber });
    if (existingLicense) {
      throw new HttpException("A doctor already exist with licenseNumber", HttpStatus.CONFLICT);
    }

    const doctorRole = await this.roleModel.findOne({ name: RoleEnum.DOCTOR });
    if (!doctorRole) {
      throw new HttpException("Doctor role not found", HttpStatus.NOT_FOUND);
    }

    if (!password) {
      throw new HttpException("Password is required", HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true,
      isActive: true,
      roles: doctorRole._id,
    });

    const doctor = await this.doctorModel.create({
      name,
      email,
      phone,
      address,
      country,
      specialization,
      licenseNumber,
      user: user._id,
    });

    await doctor.populate({ path: 'user', populate: { path: 'roles' } });

    // Send welcome email with their plaintext password (only time it's ever visible)
    await this.mailService.sendDoctorWelcomeEmail({
      to: email!,
      name: name!,
      email: email!,
      password, 
      licenseNumber,
      specialization,
    });

   await this.notificationService.saveNotification({
  title: "New Doctor Registered",
  message: `A new doctor, ${dto.name}, has been added to the system.`,
  roles: [RoleEnum.ADMIN], // Change to 'roles' and pass as an array
  userId: undefined,            
});

    return doctor;
  }



    // ADMIN ONLY
    async getAllDoctors(): Promise<Doctor[]>{
        const doctors = await this.doctorModel.find().populate({path:'user'}).populate({path:'roles'});
        return doctors;
    }

   // ADMIN ONLY
    async getDoctorById(id:string): Promise<Doctor>{
        const doctor = await this.doctorModel.findById(id).populate({path:'user'}).populate({path:'role'});
        if(!doctor){
            throw new HttpException("Doctor not found", HttpStatus.NOT_FOUND)
        }
        return doctor;
    }


    //ADMIN ONLY
    async updatedDoctor(id:string, dto:UpdateDoctorDto): Promise<Doctor>{
     const existDoctor = await this.doctorModel.findById(id)
     if(!existDoctor){
        throw new HttpException("doctor not found", HttpStatus.NOT_FOUND)
     }
        const doctor = await this.doctorModel.findByIdAndUpdate(id, dto, {new:true})
    if(!doctor){
        throw new HttpException("Failed to update Doctor", HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return doctor;
    }

    // ADMIN ONLY
    async deleteDoctor(id:string): Promise<void>{
         const existDoctor = await this.doctorModel.findById(id)
     if(!existDoctor){
        throw new HttpException("doctor not found", HttpStatus.NOT_FOUND)
     }
        const doctor = await this.doctorModel.findByIdAndDelete(id);
        if(!doctor){
            throw new HttpException("Doctor not found", HttpStatus.NOT_FOUND)
        }
    }


async findDoctorProfile(userId: string): Promise<Doctor> {
  const doctor = await this.doctorModel
    .findOne({ user: new Types.ObjectId(userId) }) 
    .populate('user') 
    .populate('roles'); 

  if (!doctor) {
    throw new HttpException('Doctor profile not found', HttpStatus.NOT_FOUND);
  }
  return doctor;
}


async updateDoctorProfile(id: string, dto: any): Promise<Doctor | null> {
  // 1. Find the Doctor and ensure they exist
  const existDoctor = await this.doctorModel.findOne({ user: new Types.ObjectId(id) });
  if (!existDoctor) throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);

  // 2. Update the User collection (Source of Truth)
  const userUpdateData: any = {};
  if (dto.name) userUpdateData.name = dto.name;
  if (dto.email) userUpdateData.email = dto.email;
  if (dto.password) userUpdateData.password = await bcrypt.hash(dto.password, 10);

  if (Object.keys(userUpdateData).length > 0) {
    await this.userModel.findByIdAndUpdate(id, userUpdateData);
  }

  // 3. Update the Doctor collection
  // Instead of deleting the email, we actively include it so the collections match.
  const doctorUpdateData = { ...dto };
  delete doctorUpdateData.password; // Security: Never update password in Doctor collection

  const doctor = await this.doctorModel.findByIdAndUpdate(
    existDoctor._id,
    doctorUpdateData,
    { new: true }
  ).populate({ path: 'user', populate: { path: 'roles' } });

  return doctor ? (doctor.toObject() as Doctor) : null;
}


async getPatientLinkedToDoctor(doctorId: string): Promise<Patient[]> {
  const doctor = await this.doctorModel.findById(doctorId);
  if (!doctor) {
    throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
  }

  const patients = await this.patientModel
    .find({ doctor: new Types.ObjectId(doctorId) })
    .populate({ path: 'doctor' });

  return patients;
}


// Inside DoctorService class

async getMyPatients(userId: string): Promise<Patient[]> {
  // 1. Find the doctor record linked to this specific user ID
  const doctor = await this.doctorModel.findOne({ user: new Types.ObjectId(userId) });
  
  if (!doctor) {
    throw new HttpException('Doctor profile not found for this user', HttpStatus.NOT_FOUND);
  }

  const patients = await this.patientModel
    .find({ doctor: doctor._id })
    .populate({ path: 'doctor' });

  return patients;
}


}