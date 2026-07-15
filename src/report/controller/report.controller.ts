import { Controller, Post, Get, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { ReportService } from '../service/report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReportDto } from '../dto/create-report.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../user/schemas/user.schema';
import { Roles } from '../../common/decorators/role.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/role.guard';

  @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post()
  @Roles(RoleEnum.PATIENT)
  async create(
    @Body() dto: CreateReportDto) 
    {
    const response = this.reportService.create(dto);
    return response;
  }

  @Get('all')
    @Roles(RoleEnum.ADMIN)
  async findAll() {
    const response = this.reportService.findAll();
    return response;
  }

  @Patch(':id/resolve')
    @Roles(RoleEnum.ADMIN)
  async resolve(@Param('id') id: string) {
    const response = this.reportService.resolve(id);
    return response;
  }
}