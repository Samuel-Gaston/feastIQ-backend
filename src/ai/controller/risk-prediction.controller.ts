import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RiskPredictionService } from '../service/risk-prediction.service';
import { AiProfile } from '../schemas/ai-profile.schema';
import { Req } from '@nestjs/common';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class RiskPredictionController {
  constructor(
    private readonly riskPredictionService: RiskPredictionService,
    @InjectModel(AiProfile.name) private readonly aiProfileModel: Model<AiProfile>,
  ) {}

 

@Get('risk-profile/my')
async getMyRiskProfile(@Req() req: any) {
  const { patientId } = await this.riskPredictionService.getMyRiskProfile(req.user._id);
  const profile = await this.aiProfileModel.findOne({ patient: new Types.ObjectId(patientId) });
  return profile?.riskScores || null;
}

  @Get('risk-profile/:patientId')
  async getRiskProfile(@Param('patientId') patientId: string) {
    const profile = await this.aiProfileModel.findOne({ patient: new Types.ObjectId(patientId) });
    return profile?.riskScores || null;
  }

  @Post('risk/score/:patientId')
  async scoreNow(@Param('patientId') patientId: string) {
    return this.riskPredictionService.manualScore(patientId);
  }
  
}