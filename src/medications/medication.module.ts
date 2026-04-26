import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Medication, MedicationSchema } from "../medications/schemas/medication.schema";
import { MedicationService } from "./services/medication.service";
import { MedicationController } from "./controllers/medication.controller";
import { Prescription, PrescriptionSchema } from "../prescription/schemas/prescriptions.schema";





@Module({
    imports:[
        MongooseModule.forFeature([
         {name:Prescription.name, schema:PrescriptionSchema},
        {name:Medication.name, schema:MedicationSchema},
        ])
    ],
    providers:[MedicationService],
    controllers:[MedicationController],
    exports:[MedicationService]
})

export class MedicationModule{}