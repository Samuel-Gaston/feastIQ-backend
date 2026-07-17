import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AppointmentService } from '../services/appointment.service';
import { CreateAppointmentDTO } from '../dtos/create-appointment.dto';
import { UpdateAppointmentStatusDTO } from '../dtos/update-appointment-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';
import { RolesGuard } from '../../common/guards/role.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../user/schemas/user.schema';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // ─── PATIENT: Book an appointment ────────────────────────────────
@Post()
@Roles(RoleEnum.PATIENT, RoleEnum.ADMIN)
async create(
  @Body() dto: CreateAppointmentDTO,
  @Req() req: any, // 1. Inject the request
) {
  const userId = req.user._id; // 2. Get the authenticated user ID
  const response = await this.appointmentService.createAppointment(userId, dto);
  return { data: response, message: 'Appointment booked successfully' };
}

  // ─── ADMIN/DOCTOR: Get all appointments ──────────────────────────
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Get all appointments' })
  async getAll(@I18n() i18n: I18nContext) {
    const response = await this.appointmentService.getAllAppointments();
    return { data: response, message: 'Appointments fetched successfully' };
  }

  // ─── PATIENT: Get my appointments ────────────────────────────────
  @Get('my/patient')
  @Roles(RoleEnum.PATIENT)
  @ApiOperation({ summary: 'Get appointments for logged-in patient' })
  async getMyPatientAppointments(@Req() req: any) {
    const response = await this.appointmentService.getPatientAppointments(req.user._id);
    return { data: response, message: 'Your appointments fetched successfully' };
  }

  // ─── DOCTOR: Get my appointments ─────────────────────────────────
  @Get('my/doctor')
  @Roles(RoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Get appointments for logged-in doctor' })
  async getMyDoctorAppointments(@Req() req: any) {
    const response = await this.appointmentService.getDoctorAppointments(req.user._id);
    return { data: response, message: 'Your appointments fetched successfully' };
  }

  // ─── Get one appointment ──────────────────────────────────────────
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR, RoleEnum.PATIENT)
  @ApiOperation({ summary: 'Get a single appointment by ID' })
  async getOne(@Param('id') id: string) {
    const response = await this.appointmentService.getOneAppointment(id);
    return { data: response, message: 'Appointment fetched successfully' };
  }

  // ─── DOCTOR: Confirm appointment ─────────────────────────────────
  @Patch(':id/confirm')
  @Roles(RoleEnum.DOCTOR, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Doctor confirms a pending appointment' })
  async confirm(@Param('id') id: string) {
    const response = await this.appointmentService.confirmAppointment(id);
    return { data: response, message: 'Appointment confirmed successfully' };
  }

  // ─── DOCTOR: Reschedule appointment ──────────────────────────────
  @Patch(':id/reschedule')
  @Roles(RoleEnum.DOCTOR, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Doctor proposes a new time for the appointment' })
  async reschedule(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDTO,
  ) {
    const response = await this.appointmentService.rescheduleAppointment(id, dto);
    return { data: response, message: 'Appointment rescheduled successfully' };
  }

  // ─── DOCTOR: Mark as completed ───────────────────────────────────
  @Patch(':id/complete')
  @Roles(RoleEnum.DOCTOR, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Doctor marks appointment as completed' })
  async complete(@Param('id') id: string) {
    const response = await this.appointmentService.completeAppointment(id);
    return { data: response, message: 'Appointment marked as completed' };
  }

  // ─── PATIENT/DOCTOR/ADMIN: Cancel appointment ────────────────────
  @Patch(':id/cancel')
  @Roles(RoleEnum.PATIENT, RoleEnum.DOCTOR, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Cancel an appointment' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDTO,
  ) {
    const response = await this.appointmentService.cancelAppointment(id, dto);
    return { data: response, message: 'Appointment cancelled successfully' };
  }

  // ─── ADMIN: General update ────────────────────────────────────────
  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Admin updates any appointment field' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDTO,
  ) {
    const response = await this.appointmentService.updateAppointment(id, dto);
    return { data: response, message: 'Appointment updated successfully' };
  }

  // ─── ADMIN: Delete appointment ────────────────────────────────────
  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete an appointment' })
  async delete(@Param('id') id: string) {
    const response = await this.appointmentService.deleteAppointment(id);
    return { data: response, message: 'Appointment deleted successfully' };
  }
}
