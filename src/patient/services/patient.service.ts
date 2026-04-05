import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Patient } from "../schemas/patient.schema";
import { Role } from "../../roles/schemas/role.schema";
import { Model } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { CreatePatientDTO } from "../dtos/create-patient.dto";
import { RoleEnum } from "../../common/enums/role.enum";
import { CodeGenerator } from "../../../utils/code-generator";
import * as bcrypt from 'bcryptjs'
import { UpdatePatientDTO } from "../dtos/update-patient.dto";
import { Doctor } from "../../doctor/schemas/doctor.schema";


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
        private readonly doctorModel: Model<Doctor>
    ){}


    async createPatient(dto: CreatePatientDTO) {
    const { name, email, address, phone } = dto;

    const existingEmail = await this.patientModel.findOne({ email });
       if (existingEmail) {
        throw new HttpException("Patient with this email already exists", HttpStatus.CONFLICT);
    }

    const patientRole = await this.roleModel.findOne({ name: RoleEnum.PATIENT });
    if (!patientRole) {
        throw new HttpException("Patient role not found",HttpStatus.NOT_FOUND);
    }

    const generatedPassword = CodeGenerator.generatePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const user = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
        isVerified: true,
        isActive: true,
        roles: patientRole._id,
    });
    await user.save(); 

    const patient = await this.patientModel.create({
        name,
        email,
        address,
        phone,
        user,
    });
    await patient.save();

    // Optional: populate the user's roles for response
  await patient.populate({ path: 'user', populate: { path: 'roles' } });

    return patient;
}
    

     async getAllPatients(): Promise<Patient[]>{
        const Patients = await this.patientModel.find().populate({path:'user'}).populate({path:'role'});
        return Patients;
    }
        
        
    async getPatientById(id:string): Promise<Patient>{
        const Patient = await this.patientModel.findById(id).populate({path:'user'}).populate({path:'role'});
        if(!Patient){
            throw new HttpException("Patient not found", HttpStatus.NOT_FOUND)
        }
        return Patient;
    }
        

    async updatedPatient(id:string, dto:CreatePatientDTO): Promise<Patient>{
           const existPatient = await this.patientModel.findById(id)
        if(!existPatient){
            throw new HttpException("Patient not found", HttpStatus.NOT_FOUND)
        }
    const Patient = await this.patientModel.findByIdAndUpdate(id, dto, {new:true})
    if(!Patient){
        throw new HttpException("Patient not found", HttpStatus.CONFLICT)
    }
    return Patient;
    }

        
    async deletePatient(id:string): Promise<void>{
           const existPatient = await this.patientModel.findById(id)
        if(!existPatient){
            throw new HttpException("Patient not found", HttpStatus.NOT_FOUND)
        }
        const Patient = await this.patientModel.findByIdAndDelete(id);
        if(!Patient){
            throw new HttpException("Patient not found", HttpStatus.NOT_FOUND)
        }
    }

      async findPatientProfile(_id: string): Promise<Patient> {
       const patient = await this.patientModel
      .findOne({ user: _id })
      .populate({ path: 'user', populate: { path: 'roles' } });
     
      if (!patient) {
      throw new HttpException('Patient profile not found', HttpStatus.NOT_FOUND);
      }

      return patient;
    }


    async updatePatientProfile(id: string, dto: UpdatePatientDTO): Promise<Patient> {
    const existPatient = await this.patientModel.findOne({ user: id });
    if (!existPatient) {
       throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
     }
     const patient = await this.patientModel.findByIdAndUpdate(
     existPatient._id,  dto, { new: true }).populate({ path: 'user', populate: { path: 'roles' } });

      if (!patient) {
     throw new HttpException('Failed to update patient profile', HttpStatus.INTERNAL_SERVER_ERROR);
     }
     return patient;
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
        return patient;
     }

}