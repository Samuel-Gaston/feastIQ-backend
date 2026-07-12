import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose"
import { Patient, PatientSchema } from "../patient/schemas/patient.schema";
import { Doctor, DoctorSchema } from "../doctor/schemas/doctor.schema";
import { ReviewService } from "./services/review.service";
import { ReviewController } from "./controllers/review.controller";
import { Review, ReviewSchema } from "./schemas/review.schema";




@Module({
    imports:[
        MongooseModule.forFeature([
         {name:Review.name, schema:ReviewSchema},
         {name:Patient.name, schema:PatientSchema},
         {name:Doctor.name, schema:DoctorSchema},
        ])
    ],
    providers:[ReviewService],
    controllers:[ReviewController],
    exports:[ReviewService]
})

export class ReviewModule{}