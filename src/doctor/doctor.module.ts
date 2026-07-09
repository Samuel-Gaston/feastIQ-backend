import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DoctorService } from "./services/doctor.service";
import { DoctorController } from "./controllers/doctor.controller";
import { Doctor, DoctorSchema } from "./schemas/doctor.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { Patient, PatientSchema } from "../patient/schemas/patient.schema";
import { MailModule } from "../common/mail/mail.module";
import { NotificationModule } from "../notification/notification.module";
@Module({
    imports:[
     MongooseModule.forFeature([
        {name: Doctor.name, schema:DoctorSchema},
    {name: User.name, schema:UserSchema},
    {name: Role.name, schema:RoleSchema},
      {name: Patient.name, schema:PatientSchema},
]), MailModule, NotificationModule
    ],
    providers:[DoctorService],
    controllers:[DoctorController],
    exports:[DoctorService]
    
})

export class DoctorModule{}