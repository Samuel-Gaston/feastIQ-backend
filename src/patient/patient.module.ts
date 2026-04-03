import { Module } from "@nestjs/common";
import { Patient, PatientSchema } from "./schemas/patient.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { PatientController } from "./controllers/patient.controller";
import { PatientService } from "./services/patient.service";





@Module({
    imports:[
       MongooseModule.forFeature([
         {name: Patient.name, schema:PatientSchema},
          {name: Role.name, schema:RoleSchema},
           {name: User.name, schema:UserSchema}
       ])
    ],
    providers:[PatientService],
    controllers:[PatientController],
    exports:[PatientService]
})
export class PatientModule{}