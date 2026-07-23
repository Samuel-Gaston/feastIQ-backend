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
import { SymptomCheckerService } from './service/symptom-checker.service';
import { SymptomCheckerController } from './controller/symptom-checker.controller';
import { AiChatMessage, AiChatMessageSchema } from './schemas/ai-chat-message.schema';
import { AiChatService } from './service/ai-chat.service';
import { AiChatController } from './controller/ai-chat.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiProfile.name, schema: AiProfileSchema },
      { name: HealthLog.name, schema: HealthLogSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Medication.name, schema: MedicationSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
       { name: AiChatMessage.name, schema: AiChatMessageSchema },
    ]),
    HealthLogsModule,
  ],
  providers: [AnomalyDetectionService, RiskPredictionService, SymptomCheckerService, AiChatService],
  controllers: [AiController, RiskPredictionController, SymptomCheckerController, AiChatController],
  exports: [AnomalyDetectionService, RiskPredictionService],
})
export class AiModule {}