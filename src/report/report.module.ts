import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from './controller/report.controller';
import { ReportService } from './service/report.service';
import { ReportSchema } from './schema/report.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Report', schema: ReportSchema }])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}