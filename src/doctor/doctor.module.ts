import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DoctorService } from "./services/doctor.service";
import { DoctorController } from "./controllers/doctor.controller";
import { Doctor, DoctorSchema } from "./schemas/doctor.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Role, RoleSchema } from "../roles/schemas/role.schema";

@Module({
    imports:[
     MongooseModule.forFeature([
        {name: Doctor.name, schema:DoctorSchema},
    {name: User.name, schema:UserSchema},
    {name: Role.name, schema:RoleSchema}])
    ],
    providers:[DoctorService],
    controllers:[DoctorController],
    exports:[DoctorService]
    
})

export class DoctorModule{}