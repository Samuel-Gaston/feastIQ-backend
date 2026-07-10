import { Module } from "@nestjs/common";
import { AppointmentController } from "./controllers/appoinment.controller";
import { AppointmentService } from "./services/appointment.service";
import { Appointment,AppointmentSchema } from "./schemas/appointment.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { Patient, PatientSchema } from "../patient/schemas/patient.schema";
import { PatientService } from "../patient/services/patient.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Doctor, DoctorSchema } from "../doctor/schemas/doctor.schema";
import { MailModule } from "../common/mail/mail.module";


@Module({
    imports:[
     MongooseModule.forFeature([
        {name: Appointment.name, schema:AppointmentSchema},
        {name: Patient.name, schema:PatientSchema},
        { name: User.name, schema: UserSchema },           
      { name: Role.name, schema: RoleSchema },
       { name: Doctor.name, schema: DoctorSchema },
     ]), MailModule
    ],
    controllers:[AppointmentController],
    providers:[AppointmentService, PatientService],
    exports: [AppointmentService, PatientService, MongooseModule]
})

export class AppoinmentModule{}