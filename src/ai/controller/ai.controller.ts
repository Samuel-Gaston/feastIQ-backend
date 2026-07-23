// ai/controllers/ai.controller.ts
import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnomalyDetectionService } from '../service/anomaly-detection.service';
import { ApiOperation } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';


@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly anomalyDetectionService: AnomalyDetectionService) {}

  @Post('anomaly/train/:patientId')
  @ApiOperation({summary:'train'})
  async trainNow(@Param('patientId') patientId: string) {
    return this.anomalyDetectionService.manualTrain(patientId);
  }
}