import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './gateway/doctorPatientMessage.gateway';
import { ChatService } from './service/doctorPatientMessage.service';
import { ChatController } from './controller/doctorPatientMessage.controller';
import { ChatMessage, ChatMessageSchema } from './schema/doctorPatientMessage.schema';
import { Appointment, AppointmentSchema } from '../appointment/schemas/appointment.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Doctor, DoctorSchema } from '../doctor/schemas/doctor.schema';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}), // gateway verifies with an explicit secret per-call, so no default secret needed here
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Patient.name,     schema: PatientSchema },
      { name: Doctor.name,      schema: DoctorSchema },
    ]),
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class doctorPatientMessageModule {}