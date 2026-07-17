import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConsultationController } from "./controller/consultation.controller";
import { ConsultationService } from "./service/consultation.service";
import { Consultation, ConsultationSchema } from "./schema/consultation.schema";
import { Doctor, DoctorSchema } from "../doctor/schemas/doctor.schema"; 
import { AppoinmentModule } from "../appointment/appointment.module";
import { Patient, PatientSchema } from "../patient/schemas/patient.schema";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Consultation.name, schema: ConsultationSchema },
      { name: Doctor.name, schema: DoctorSchema }, 
      { name: Patient.name, schema: PatientSchema }
    ]),
    AppoinmentModule,
  ],
  controllers: [ConsultationController],
  providers: [ConsultationService],
  exports: [ConsultationService],
})
export class ConsultationModule {}
