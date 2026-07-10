import { InjectModel } from "@nestjs/mongoose";
import { Appointment } from "../schemas/appointment.schema";
import { Model } from "mongoose";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateAppointmentDTO } from "../dtos/create-appointment.dto";
import { Patient } from "../../patient/schemas/patient.schema";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { AppointmentStatus } from "../../common/enums/appointment-status.enum";
import { ConsultationType } from "../../common/enums/consultation-type.enum";


@Injectable()
export class AppointmentService{
    constructor(
        @InjectModel(Appointment.name)
        private readonly appointmentModel: Model<Appointment>,

        @InjectModel(Patient.name)
        private readonly patientModel: Model<Patient>,

     @InjectModel(Doctor.name)
    private readonly doctorModel: Model<Doctor>,

    ){}

async createAppointment(userId:string, dto: CreateAppointmentDTO): Promise<Appointment> {
const { scheduledAt, status, consultationType, reason, notes } = dto;

  const doctor = await this.doctorModel.findOne({ user: userId });
  if (!doctor) {
    throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
  }


  const patient = await this.patientModel.findById(dto.patient);
  if (!patient) {
    throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
  }


  const appointment = await this.appointmentModel.create({
    patient: patient._id, 
    doctor: doctor._id,
    scheduledAt,
    status,
    consultationType,
    reason,
    notes,
  });

  return appointment;
}

    async getAllDoctorAppointments(doctorId:string): Promise<Appointment[]>{
        const appoinments = await this.appointmentModel.find({doctorId})
        .populate({path:'patient'}).populate({path:'doctor'})
        return appoinments;
    }

    

    async getAllAppointments(): Promise<Appointment[]>{
        const appointments = await this.appointmentModel.find()
        .populate({path:'patient'})
        return appointments;
    }
     

     async getAppointmentById(id:string): Promise<Appointment>{
        const appointment = await this.appointmentModel.findById(id)
        .populate({path:'patient'});
        if (!appointment) {
            throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
        }
        return appointment;
     }


     async updateAppointment(id:string, dto: CreateAppointmentDTO): Promise<Appointment>{
         const existAppointment = await this.appointmentModel.findById(id)
         if(!existAppointment){
            throw new HttpException("Appointment not found", HttpStatus.NOT_FOUND)
         }
         const appointment = await  this.appointmentModel.findByIdAndUpdate(id, dto, {new:true})
         if(!appointment){
            throw new HttpException("Failed to updated appoinment", HttpStatus.INTERNAL_SERVER_ERROR)
         }
         return appointment;
     }



     async deleteAppointment(id:string): Promise<Appointment>{
          const existAppointment = await this.appointmentModel.findById(id)
         if(!existAppointment){
            throw new HttpException("Appointment not found", HttpStatus.NOT_FOUND)
         }
         const appointment = await this.appointmentModel.findByIdAndDelete(id)
            if(!appointment){
                throw new HttpException("Failed to delete appointment", HttpStatus.INTERNAL_SERVER_ERROR)
            } 
            return appointment;
     }

     async updateStatus(
  id: string, 
  updateData: { status: AppointmentStatus; reason?: string; newScheduledAt?: Date }
): Promise<Appointment> {
  const updatePayload: any = {
    status: updateData.status,
  };
  if (updateData.reason) {
    updatePayload.statusReason = updateData.reason;
  }
  
  if (updateData.newScheduledAt) {
    updatePayload.scheduledAt = updateData.newScheduledAt;
  }
  const updatedAppointment = await this.appointmentModel.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true } 
  );
  if (!updatedAppointment) {
    throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
  }

  return updatedAppointment;
}

 }