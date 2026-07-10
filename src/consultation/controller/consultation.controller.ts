import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";
import { ConsultationService } from "../service/consultation.service";
import { CreateConsultationDTO } from "../dtos/create-consultation.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Consultations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  @Roles(RoleEnum.DOCTOR)
  async create(@CurrentUser() user: any, @Body() dto: CreateConsultationDTO) {
    return await this.consultationService.create(user.doctorProfileId, dto);
  }

  @Get('patient/:patientId')
  @Roles(RoleEnum.DOCTOR, RoleEnum.ADMIN)
  async getPatientHistory(@Param('patientId') patientId: string) {
    return await this.consultationService.getPatientHistory(patientId);
  }
}