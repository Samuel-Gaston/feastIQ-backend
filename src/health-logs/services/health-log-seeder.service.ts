// health-logs/services/health-log-seeder.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { HealthLog } from '../schemas/health-log.schema';

@Injectable()
export class HealthLogSeederService implements OnModuleInit {
  private readonly logger = new Logger(HealthLogSeederService.name);

  constructor(
    @InjectModel(HealthLog.name) private readonly healthLogModel: Model<HealthLog>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const shouldSeed = this.configService.get<string>('SEED_HEALTH_LOGS') === 'true';
    if (!shouldSeed) return;

    const patientId = this.configService.get<string>('SEED_PATIENT_ID');
    if (!patientId) {
      this.logger.warn('SEED_HEALTH_LOGS=true but SEED_PATIENT_ID is missing — skipping seed');
      return;
    }

    // Don't reseed if this patient already has enough logs — avoids
    // piling up duplicates on every dev-server restart
    const existingCount = await this.healthLogModel.countDocuments({
      patient: new Types.ObjectId(patientId),
    });

    if (existingCount >= 14) {
      this.logger.log(`Patient ${patientId} already has ${existingCount} health logs — skipping seed`);
      return;
    }

    await this.seed(patientId);
  }

 private async seed(patientId: string) {
  const baseline = { hr: 72, sys: 118, dia: 78, spo2: 97, glucose: 95 };
  const docs: any[] = []; // ← add the type annotation here

  for (let i = 20; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    docs.push({
      patient: new Types.ObjectId(patientId),
      timestamp: date,
      heartRate: baseline.hr + Math.round((Math.random() - 0.5) * 10),
      bloodPressure: {
        systolic: baseline.sys + Math.round((Math.random() - 0.5) * 12),
        diastolic: baseline.dia + Math.round((Math.random() - 0.5) * 8),
      },
      oxygenSaturation: baseline.spo2 + Math.round((Math.random() - 0.5) * 3),
      glucose: baseline.glucose + Math.round((Math.random() - 0.5) * 20),
      sleepHours: 6 + Math.random() * 3,
      steps: 3000 + Math.round(Math.random() * 7000),
      source: 'manual',
    });
  }

  await this.healthLogModel.insertMany(docs);
  this.logger.log(`Seeded ${docs.length} health logs for patient ${patientId}`);
}
}