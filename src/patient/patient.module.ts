import { Module } from "@nestjs/common";
import { Patient, PatientSchema } from "./schemas/patient.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { PatientController } from "./controllers/patient.controller";
import { PatientService } from "./services/patient.service";
import {Doctor, DoctorSchema } from "../doctor/schemas/doctor.schema";
import { MailModule } from "../common/mail/mail.module";
import { NotificationModule } from "../notification/notification.module";




@Module({
    imports:[
       MongooseModule.forFeature([
        {name: Patient.name, schema:PatientSchema},
        {name: Role.name, schema:RoleSchema},
        {name: User.name, schema:UserSchema},
        {name: Doctor.name, schema:DoctorSchema}
       ]) ,
  MailModule, NotificationModule  ],
    providers:[PatientService],
    controllers:[PatientController],
    exports:[PatientService]
})
export class PatientModule{}