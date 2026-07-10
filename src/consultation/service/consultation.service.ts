import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {Consultation} from "../schema/consultation.schema";
import { Appointment } from "../../appointment/schemas/appointment.schema";
import { CreateConsultationDTO } from "../dtos/create-consultation.dto";
import { AppointmentStatus } from "../../common/enums/appointment-status.enum";
  import { Types } from "mongoose"; 

@Injectable()
export class ConsultationService {
  constructor(
    @InjectModel(Consultation.name) private readonly consultationModel: Model<Consultation>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>
  ) {}


async create(doctorId: string, dto: CreateConsultationDTO): Promise<Consultation> {
    const appointment = await this.appointmentModel.findById(dto.appointmentId);
    if (!appointment) throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);

    // Convert the string doctorId to a Mongoose ObjectId
    const doctorObjectId = new Types.ObjectId(doctorId);

    const consultation = await this.consultationModel.create({
      ...dto,
      appointment: appointment._id,
      patient: appointment.patient,
      doctor: doctorObjectId, // Pass the ObjectId here
    });

    await this.appointmentModel.findByIdAndUpdate(dto.appointmentId, { 
        status: AppointmentStatus.Completed 
    });
    
    return consultation;
}





  async getPatientHistory(patientId: string): Promise<Consultation[]> {
    const history = await this.consultationModel
      .find({ patient: patientId })
      .populate('doctor')       // Populate doctor details for the report
      .populate('appointment')  // Optional: populate appointment if needed
      .sort({ createdAt: -1 })  // Most recent consultations first
      .exec();

    if (!history || history.length === 0) {
      return [];
    }

    return history;
  }


}