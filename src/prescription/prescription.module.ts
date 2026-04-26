import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Prescription, PrescriptionSchema } from "./schemas/prescriptions.schema";
import { Patient, PatientSchema } from "../patient/schemas/patient.schema";
import { Doctor, DoctorSchema } from "../doctor/schemas/doctor.schema";
import { Appointment, AppointmentSchema } from "../appointment/schemas/appointment.schema";
import { PrescriptionService } from "./services/prescription.service";
import { PrescriptionController } from "./controllers/prescription.controller";
import { Medication, MedicationSchema } from "../medications/schemas/medication.schema";






@Module({
    imports:[
        MongooseModule.forFeature([
         {name:Prescription.name, schema:PrescriptionSchema},
         {name:Patient.name, schema:PatientSchema},
         {name:Doctor.name, schema:DoctorSchema},
         {name:Appointment.name, schema:AppointmentSchema},
        {name:Medication.name, schema:MedicationSchema},
        ])
    ],
    providers:[PrescriptionService],
    controllers:[PrescriptionController],
    exports:[PrescriptionService]
})

export class PrescriptionModule{}