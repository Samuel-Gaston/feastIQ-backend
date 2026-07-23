import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import * as path from 'path';
import { AiProfile } from '../schemas/ai-profile.schema';
import { HealthLogsService } from '../../health-logs/services/health-logs.service';
import { Patient } from '../../patient/schemas/patient.schema';
import { Medication } from '../../medications/schemas/medication.schema';
import { Prescription } from '../../prescription/schemas/prescriptions.schema';

const MODEL_DIR = path.join(process.cwd(), 'ml-models/risk-model');
const NORM_STATS_PATH = path.join(process.cwd(), 'src/ml-training/processed/normalization.json');

@Injectable()
export class RiskPredictionService implements OnModuleInit {
  private readonly logger = new Logger(RiskPredictionService.name);
  private model: tf.LayersModel | null = null;
  private normStats: { means: number[]; stds: number[] } | null = null;

  constructor(
    @InjectModel(AiProfile.name) private readonly aiProfileModel: Model<AiProfile>,
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
    @InjectModel(Medication.name) private readonly medicationModel: Model<Medication>,
    @InjectModel(Prescription.name) private readonly prescriptionModel: Model<Prescription>,
    private readonly healthLogsService: HealthLogsService,
  ) {}

  async onModuleInit() {
    try {
      this.normStats = JSON.parse(fs.readFileSync(NORM_STATS_PATH, 'utf8'));

      const meta = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, 'model.json'), 'utf8'));
      const weightBuffer = fs.readFileSync(path.join(MODEL_DIR, 'weights.bin'));
      const artifacts: tf.io.ModelArtifacts = {
        modelTopology: meta.modelTopology,
        weightSpecs: meta.weightSpecs,
        weightData: weightBuffer.buffer.slice(weightBuffer.byteOffset, weightBuffer.byteOffset + weightBuffer.byteLength),
        format: meta.format,
        generatedBy: meta.generatedBy,
        convertedBy: meta.convertedBy,
      };
      this.model = await tf.loadLayersModel(tf.io.fromMemory(artifacts));
      this.logger.log('Risk prediction model loaded');
    } catch (err: any) {
      this.logger.warn(`Risk model not loaded — run train-risk-model.ts first. (${err.message})`);
    }
  }

  private normalizeFeatures(raw: number[]): number[] {
    if (!this.normStats) throw new Error('Normalization stats not loaded');
    return raw.map((v, i) => (v - this.normStats!.means[i]) / this.normStats!.stds[i]);
  }

  async manualScore(patientId: string) {
    return this.scoreOnePatient(patientId);
  }

  private async scoreOnePatient(patientId: string) {
    if (!this.model) throw new Error('Risk model not loaded');

    const patient = await this.patientModel.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    const recentVitals = await this.healthLogsService.getRecentLogs(patientId, 7);
    const avg = (fn: (l: any) => number | undefined) => {
      const values = recentVitals.map(fn).filter((v): v is number => typeof v === 'number');
      return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    };

    const prescriptions = await this.prescriptionModel.find({ patient: new Types.ObjectId(patientId) }).select('_id');
    const medicationCount = await this.medicationModel.countDocuments({
      prescription: { $in: prescriptions.map(p => p._id) },
    });

    const rawFeatures = [
      patient.age || 0,
      patient.bmi || 0,
      avg(l => l.heartRate),
      avg(l => l.bloodPressure?.systolic),
      avg(l => l.bloodPressure?.diastolic),
      avg(l => l.glucose),
      avg(l => l.oxygenSaturation),
      avg(l => l.sleepHours),
      avg(l => l.steps),
      medicationCount,
      patient.chronicConditionFlag ? 1 : 0,
      patient.gender === 'male' ? 1 : 0,
    ];

    const normalized = this.normalizeFeatures(rawFeatures);
    const input = tf.tensor2d([normalized]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const [diabetes, hypertension, heartDisease] = await prediction.data();

    await this.aiProfileModel.findOneAndUpdate(
      { patient: new Types.ObjectId(patientId) },
      { $set: { riskScores: { diabetes, hypertension, heartDisease }, riskComputedAt: new Date() } },
      { upsert: true },
    );

    input.dispose();
    prediction.dispose();

    this.logger.log(`Risk scored patient ${patientId}: diabetes=${diabetes.toFixed(3)} hypertension=${hypertension.toFixed(3)} heartDisease=${heartDisease.toFixed(3)}`);
    return { diabetes, hypertension, heartDisease };
  }

  @Cron('0 2 * * *')
  async nightlyRiskScoring() {
    const patientIds = await this.healthLogsService.getAllActivePatientIds();
    for (const id of patientIds) {
      await this.scoreOnePatient(id.toString()).catch(err =>
        this.logger.warn(`Risk scoring failed for patient ${id}: ${err.message}`),
      );
    }
  }
}