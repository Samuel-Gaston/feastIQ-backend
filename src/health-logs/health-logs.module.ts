import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthLog, HealthLogSchema } from './schemas/health-log.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { HealthLogsService } from './services/health-logs.service';
import { HealthLogsController } from './controller/health-logs.controller';
import { HealthLogSeederService } from './services/health-log-seeder.service'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HealthLog.name, schema: HealthLogSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  providers: [HealthLogsService, HealthLogSeederService], 
  controllers: [HealthLogsController],
  exports: [HealthLogsService],
})
export class HealthLogsModule {}