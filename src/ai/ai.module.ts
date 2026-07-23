import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiProfile, AiProfileSchema } from './schemas/ai-profile.schema';
import { AnomalyDetectionService } from './service/anomaly-detection.service';
import { RiskPredictionService } from './service/risk-prediction.service';
import { HealthLog, HealthLogSchema } from '../health-logs/schemas/health-log.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Medication, MedicationSchema } from '../medications/schemas/medication.schema';
import { Prescription, PrescriptionSchema } from '../prescription/schemas/prescriptions.schema';
import { HealthLogsModule } from '../health-logs/health-logs.module';
import { AiController } from './controller/ai.controller';
import { RiskPredictionController } from './controller/risk-prediction.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiProfile.name, schema: AiProfileSchema },
      { name: HealthLog.name, schema: HealthLogSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Medication.name, schema: MedicationSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
    ]),
    HealthLogsModule,
  ],
  providers: [AnomalyDetectionService, RiskPredictionService],
  controllers: [AiController, RiskPredictionController],
  exports: [AnomalyDetectionService, RiskPredictionService],
})
export class AiModule {}