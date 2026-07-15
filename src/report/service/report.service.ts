import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report } from '../schema/report.schema';
import { CreateReportDto } from '../dto/create-report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>
) {}

  async create(dto: CreateReportDto): Promise<Report> {
   const {description, subject, priority} = dto;
   const report = await this.reportModel.create({
    subject,
    description,
    priority
   })
   return report;
  }

  async findAll() {
    return await this.reportModel.find()
    .populate('user', 'name email')
    .populate({path: "roles"})
    .exec();
  }

  async resolve(id: string) {
    return await this.reportModel.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
  }
}