import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Doctor } from "../schemas/doctor.schema";
import { Model } from "mongoose";
import { CreateDoctorDto } from "../dtos/create-doctor.dto";
import { Role } from "../../roles/schemas/role.schema";
import { RoleEnum } from "../../common/enums/role.enum";
import { CodeGenerator } from "../../../utils/code-generator";
import * as bcrypt from 'bcryptjs';
import { User } from "../../user/schemas/user.schema";
import { UpdateDoctorDto } from "../dtos/update-doctor.dto";





@Injectable()
export class DoctorService{
    constructor(
        @InjectModel(Doctor.name)
        private readonly doctorModel: Model<Doctor>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>,

        @InjectModel(User.name)
        private readonly userModel: Model<User>
    ){}

    async createDoctor(dto:CreateDoctorDto){
        const {name, email, phone, address, country, specialization, licenseNumber} = dto;
    
        const existingDoctor = await this.doctorModel.findOne({email})
        if(existingDoctor){
            throw new HttpException("A doctor already exist with email", HttpStatus.CONFLICT)
        }

       const existingLicense = await this.doctorModel.findOne({licenseNumber})
       if(existingLicense){
        throw new HttpException("A doctor already exist with licenseNumber", HttpStatus.CONFLICT)
       }

        const doctorRole = await this.roleModel.findOne({name: RoleEnum.DOCTOR})
        if(!doctorRole){
            throw new HttpException("Doctor role not found", HttpStatus.NOT_FOUND)
        }
        
        const generatePassword = CodeGenerator.generatePassword();
        const hashedPassword = await bcrypt.hash(generatePassword, 10);
    
        const user = await this.userModel.create({
            name,
            email,
            password:hashedPassword,
            isVerified:true,
            isActive:true,
            roles: doctorRole
        })
        await user.save();

     const doctor = await this.doctorModel.create({
        name,
        email,
        phone,
        address,
        country,
        specialization,
        licenseNumber,
        user
     })

     await doctor.populate("user.roles")
       
    return doctor;
    

    }


    async getAllDoctors(): Promise<Doctor[]>{
        const doctors = await this.doctorModel.find().populate('user', 'name email').populate('roles', 'name description');
        return doctors;
    }


    async getDoctorById(id:string): Promise<Doctor>{
        const doctor = await this.doctorModel.findById(id).populate('user', 'name email').populate('roles', 'name description');
        if(!doctor){
            throw new HttpException("Doctor not found", HttpStatus.NOT_FOUND)
        }
        return doctor;
    }

    async updatedDoctor(id:string, dto:UpdateDoctorDto): Promise<Doctor>{
        const doctor = await this.doctorModel.findByIdAndUpdate(id, {dto}, {new:true})
    if(!doctor){
        throw new HttpException("Doctor not found", HttpStatus.CONFLICT)
    }
    return doctor;
    }

    async deleteDoctor(id:string): Promise<void>{
        const doctor = await this.doctorModel.findByIdAndDelete(id);
        if(!doctor){
            throw new HttpException("Doctor not found", HttpStatus.NOT_FOUND)
        }
    }
}