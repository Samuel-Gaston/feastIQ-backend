
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { HealthLog } from "../schemas/health-log.schema";
import { Patient } from "../../patient/schemas/patient.schema";
import { EventEmitter2 } from "@nestjs/event-emitter"; // npm install @nestjs/event-emitter
import { CreateHealthLogDTO } from "../dtos/create-health-log.dto";

@Injectable()
export class HealthLogsService {
  constructor(
    @InjectModel(HealthLog.name) private readonly healthLogModel: Model<HealthLog>,
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  
  async createLog(userId: string, dto: CreateHealthLogDTO) {
    const patient = await this.patientModel.findOne({ user: new Types.ObjectId(userId) });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const log = await this.healthLogModel.create({
      ...dto,
      patient: patient._id,
      timestamp: new Date(),
    });

    // FR-09: trigger AI anomaly pipeline immediately after save — async,
    // does not block the response to the client
    this.eventEmitter.emit('vital.saved', { patientId: patient._id.toString(), logId: log._id.toString() });

    return log;
  }



  async getMyLogs(userId: string, limit = 100) {
    const patient = await this.patientModel.findOne({ user: new Types.ObjectId(userId) });
    if (!patient) throw new NotFoundException('Patient profile not found');

    return this.healthLogModel
      .find({ patient: patient._id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  // GET /health-logs/summary — powers FR-08's dashboard cards (current/min/max/avg)
  async getSummary(userId: string, days = 7) {
    const patient = await this.patientModel.findOne({ user: new Types.ObjectId(userId) });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.healthLogModel
      .find({ patient: patient._id, timestamp: { $gte: since } })
      .sort({ timestamp: 1 })
      .lean();

    if (logs.length === 0) return { count: 0 };

    const summarize = (key: string, nested?: string) => {
      const values = logs
        .map(l => (nested ? (l as any)[key]?.[nested] : (l as any)[key]))
        .filter((v: any) => typeof v === 'number');
      if (values.length === 0) return null;
      return {
        current: values[values.length - 1],
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a: number, b: number) => a + b, 0) / values.length,
      };
    };

    return {
      count: logs.length,
      heartRate: summarize('heartRate'),
      systolic: summarize('bloodPressure', 'systolic'),
      diastolic: summarize('bloodPressure', 'diastolic'),
      glucose: summarize('glucose'),
      oxygenSaturation: summarize('oxygenSaturation'),
      sleepHours: summarize('sleepHours'),
      steps: summarize('steps'),
      series: logs, // raw series for FR-08's chart rendering
    };
  }

  // Used internally by both ML services — raw records for a given lookback window
  async getRecentLogs(patientId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.healthLogModel
      .find({ patient: new Types.ObjectId(patientId), timestamp: { $gte: since } })
      .sort({ timestamp: 1 })
      .lean();
  }

  async getAllActivePatientIds() {
    return this.healthLogModel.distinct('patient');
  }

  // Called by the anomaly service after inference to write the result back onto the log
  async markAnomalyResult(logId: string, isAnomaly: boolean, score: number) {
    await this.healthLogModel.findByIdAndUpdate(logId, {
      anomalyFlag: isAnomaly,
      anomalyScore: score,
    });
  }
}