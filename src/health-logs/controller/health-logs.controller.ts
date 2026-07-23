import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { HealthLogsService } from "../services/health-logs.service";
import { CreateHealthLogDTO } from "../dtos/create-health-log.dto";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth() 
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('health-logs')
export class HealthLogsController {
  constructor(private readonly healthLogsService: HealthLogsService) {}

  @Post()
  @Roles(RoleEnum.PATIENT)
  async create(@Req() req: any, @Body() dto: CreateHealthLogDTO) {
    return this.healthLogsService.createLog(req.user._id, dto);
  }

  @Get()
  @Roles(RoleEnum.PATIENT)
  async getMine(@Req() req: any, @Query('limit') limit?: string) {
    return this.healthLogsService.getMyLogs(req.user._id, limit ? Number(limit) : undefined);
  }

  @Get('summary')
  @Roles(RoleEnum.PATIENT)
  async getSummary(@Req() req: any, @Query('days') days?: string) {
    return this.healthLogsService.getSummary(req.user._id, days ? Number(days) : undefined);
  }
}