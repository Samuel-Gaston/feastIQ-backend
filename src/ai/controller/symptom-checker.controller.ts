import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SymptomCheckerService } from '../service/symptom-checker.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class SymptomCheckerController {
  constructor(private readonly symptomCheckerService: SymptomCheckerService) {}

  @Post('symptom-check')
  check(@Body('symptoms') symptoms: string) {
    return this.symptomCheckerService.analyze(symptoms || '');
  }
}