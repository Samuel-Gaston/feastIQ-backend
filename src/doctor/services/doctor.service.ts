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
      password, // ← plaintext, BEFORE hashing — this is the only place it's ever sent
      licenseNumber,
      specialization,
    });

    return doctor;
  }



    // ADMIN ONLY
    async getAllDoctors(): Promise<Doctor[]>{
        const doctors = await this.doctorModel.find().populate({path:'user'}).populate({path:'role'});
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


   // GET PROFILE (DOCTOR ONLY)
    async findDoctorProfile(id: string): Promise<Doctor> {
    const user = await this.doctorModel
    .findById(id)
    .populate({path:'permissions'})
    .populate({path:'doctor'})
    .populate({path:'role'});

    if (!user) {
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
}

    // UPDATE DOCTOR PROFILE (DOCTOR ONLY)
    async updateDoctorProfile(id: string, dto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.doctorModel.findById(id);
    if (!doctor) {
       throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }

    const updated = await this.doctorModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) {
       throw new HttpException('Failed to update', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return updated;
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


}