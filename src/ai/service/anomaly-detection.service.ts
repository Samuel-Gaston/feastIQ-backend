import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import { AiProfile } from '../schemas/ai-profile.schema';
import { HealthLogsService } from '../../health-logs/services/health-logs.service';
import { HealthLog } from '../../health-logs/schemas/health-log.schema';

const WINDOW_SIZE = 6;
const FEATURE_KEYS = ['heartRate', 'systolic', 'diastolic', 'oxygenSaturation', 'glucose'] as const;
const MIN_LOGS_REQUIRED = 14; // ⚠️ assumption — adjust if your report specifies a different minimum
const MODEL_DIR = './ml-models/anomaly';

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);
  private modelCache = new Map<string, tf.LayersModel>();

  constructor(
    @InjectModel(AiProfile.name) private readonly aiProfileModel: Model<AiProfile>,
    @InjectModel(HealthLog.name) private readonly healthLogModel: Model<HealthLog>,
    private readonly healthLogsService: HealthLogsService,
  ) {}

  // ── Flatten a HealthLog's nested bloodPressure into a flat feature record ──
  private flatten(log: any) {
    return {
      heartRate: log.heartRate || 0,
      systolic: log.bloodPressure?.systolic || 0,
      diastolic: log.bloodPressure?.diastolic || 0,
      oxygenSaturation: log.oxygenSaturation || 0,
      glucose: log.glucose || 0,
    };
  }

  private computeStats(logs: any[]) {
    const flat = logs.map(l => this.flatten(l));
    const stats: any = {};
    for (const key of FEATURE_KEYS) {
      const values = flat.map(r => (r as any)[key]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
      stats[key] = { mean, std: Math.sqrt(variance) || 1 };
    }
    return stats; // matches AiProfile.baselineVitals shape exactly
  }

  private normalize(log: any, stats: any): number[] {
    const flat = this.flatten(log);
    return FEATURE_KEYS.map(key => ((flat as any)[key] - stats[key].mean) / stats[key].std);
  }

  private buildSequences(logs: any[], stats: any): number[][][] {
    const normalized = logs.map(l => this.normalize(l, stats));
    const sequences: number[][][] = [];
    for (let i = 0; i <= normalized.length - WINDOW_SIZE; i++) {
      sequences.push(normalized.slice(i, i + WINDOW_SIZE));
    }
    return sequences;
  }

  // ── Listens for the event HealthLogsService emits on every save (FR-09) ──
  // Payload matches exactly what createLog() emits: { patientId, logId }
  @OnEvent('vital.saved')
  async handleVitalSaved(payload: { patientId: string; logId: string }) {
    const profile = await this.aiProfileModel.findOne({ patient: new Types.ObjectId(payload.patientId) });
    if (!profile?.anomalyModelPath) {
      this.logger.debug(`No trained model yet for patient ${payload.patientId} — will train once enough data exists`);
      return;
    }
    await this.detectAnomaly(payload.patientId, payload.logId);
  }

  // ── Train (or retrain) a model for one patient ──
  async trainForPatient(patientId: string) {
    const logs = await this.healthLogsService.getRecentLogs(patientId, 90);
    if (logs.length < MIN_LOGS_REQUIRED) {
      this.logger.debug(`Patient ${patientId} has ${logs.length} logs — needs ${MIN_LOGS_REQUIRED}`);
      return null;
    }

    const stats = this.computeStats(logs);
    const sequences = this.buildSequences(logs, stats);
    if (sequences.length < 5) return null;

    const xs = tf.tensor3d(sequences);

    const model = tf.sequential({
      layers: [
        tf.layers.lstm({ units: 64, inputShape: [WINDOW_SIZE, FEATURE_KEYS.length], returnSequences: false }),
        tf.layers.repeatVector({ n: WINDOW_SIZE }),
        tf.layers.lstm({ units: 64, returnSequences: true }),
        tf.layers.timeDistributed({ layer: tf.layers.dense({ units: FEATURE_KEYS.length }) }),
      ],
    });
    model.compile({ optimizer: tf.train.adam(0.001), loss: 'meanSquaredError' });
    await model.fit(xs, xs, { epochs: 50, batchSize: 8, shuffle: true, verbose: 0 });

    const predictions = model.predict(xs) as tf.Tensor;
    const xsArr = (await xs.array()) as number[][][];
    const predArr = (await predictions.array()) as number[][][];

    const errors = xsArr
      .map((seq, i) => {
        let mse = 0;
        for (let t = 0; t < WINDOW_SIZE; t++)
          for (let f = 0; f < FEATURE_KEYS.length; f++)
            mse += (seq[t][f] - predArr[i][t][f]) ** 2;
        return mse / (WINDOW_SIZE * FEATURE_KEYS.length);
      })
      .sort((a, b) => a - b);

    const threshold = errors[Math.floor(errors.length * 0.95)];
    const modelPath = `${MODEL_DIR}/${patientId}`;
    fs.mkdirSync(modelPath, { recursive: true });
    await this.saveModelToDisk(model, modelPath);

    
    await this.aiProfileModel.findOneAndUpdate(
      { patient: new Types.ObjectId(patientId) },
      {
        $set: {
         anomalyModelPath: modelPath,
          baselineVitals: stats,
          anomalyThreshold: threshold,
          anomalyModelTrainedAt: new Date(),
        },
      },
      { upsert: true },
    );

    this.modelCache.delete(patientId);
    xs.dispose();
    predictions.dispose();

    this.logger.log(`Trained anomaly model for patient ${patientId} (threshold=${threshold.toFixed(4)})`);
    return { threshold };
  }

    // ── Manual trigger for testing — calls the same training logic ──
async manualTrain(patientId: string) {
  return this.trainForPatient(patientId);
}

  // ── Run inference on a patient's latest window of readings ──
  async detectAnomaly(patientId: string, logId: string) {
    const profile = await this.aiProfileModel.findOne({ patient: new Types.ObjectId(patientId) });
    if (!profile?.anomalyModelPath) return null;

    let model = this.modelCache.get(patientId);
    if (!model) {
      model = await this.loadModelFromDisk(profile.anomalyModelPath);
      this.modelCache.set(patientId, model);
    }

    const recent = await this.healthLogsService.getRecentLogs(patientId, 7);
    if (recent.length < WINDOW_SIZE) return null;

    const window = recent.slice(-WINDOW_SIZE);
    const sequence = window.map(l => this.normalize(l, profile.baselineVitals));
    const input = tf.tensor3d([sequence]);
    const prediction = model.predict(input) as tf.Tensor;

    const inputArr = (await input.array()) as number[][][];
    const predArr = (await prediction.array()) as number[][][];

    let mse = 0;
    for (let t = 0; t < WINDOW_SIZE; t++)
      for (let f = 0; f < FEATURE_KEYS.length; f++)
        mse += (inputArr[0][t][f] - predArr[0][t][f]) ** 2;
    const error = mse / (WINDOW_SIZE * FEATURE_KEYS.length);
    const isAnomaly = error > (profile.anomalyThreshold ?? Infinity);

    // Write result back onto the triggering HealthLog — matches Table 11's
    // anomalyFlag/anomalyScore fields exactly
    await this.healthLogsService.markAnomalyResult(logId, isAnomaly, error);

    await this.aiProfileModel.updateOne(
      { patient: new Types.ObjectId(patientId) },
      { $push: { anomalyHistory: { timestamp: new Date(), score: error, isAnomaly } } },
    );

    input.dispose();
    prediction.dispose();

    return { isAnomaly, reconstructionError: error, threshold: profile.anomalyThreshold };
  }

  // ── Weekly retraining for all patients with enough accumulated data ──
  @Cron('0 4 * * 0') // Sundays 4am — separate from Model 2's nightly 2am job
  async weeklyRetrain() {
    const patientIds = await this.healthLogsService.getAllActivePatientIds();
    for (const patientId of patientIds) {
      await this.trainForPatient(patientId.toString()).catch(err =>
        this.logger.warn(`Training failed for patient ${patientId}: ${err.message}`),
      );
    }
  }

  private async saveModelToDisk(model: tf.LayersModel, dir: string) {
  fs.mkdirSync(dir, { recursive: true });
  await model.save(
    tf.io.withSaveHandler(async (artifacts) => {
      fs.writeFileSync(
        `${dir}/weights.bin`,
        Buffer.from(artifacts.weightData as ArrayBuffer),
      );
      fs.writeFileSync(
        `${dir}/model.json`,
        JSON.stringify({
          modelTopology: artifacts.modelTopology,
          weightSpecs: artifacts.weightSpecs,
          format: artifacts.format,
          generatedBy: artifacts.generatedBy,
          convertedBy: artifacts.convertedBy,
        }),
      );
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: 'JSON',
        },
      };
    }),
  );
}

private async loadModelFromDisk(dir: string): Promise<tf.LayersModel> {
  const meta = JSON.parse(fs.readFileSync(`${dir}/model.json`, 'utf8'));
  const weightBuffer = fs.readFileSync(`${dir}/weights.bin`);
  const artifacts: tf.io.ModelArtifacts = {
    modelTopology: meta.modelTopology,
    weightSpecs: meta.weightSpecs,
    weightData: weightBuffer.buffer.slice(
      weightBuffer.byteOffset,
      weightBuffer.byteOffset + weightBuffer.byteLength,
    ),
    format: meta.format,
    generatedBy: meta.generatedBy,
    convertedBy: meta.convertedBy,
  };
  return tf.loadLayersModel(tf.io.fromMemory(artifacts));
}


}