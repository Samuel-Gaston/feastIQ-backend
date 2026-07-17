import { Controller, Post, Get, Body, Param, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConsultationService } from "../service/consultation.service";
import { CreateConsultationDTO } from "../dtos/create-consultation.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";

@ApiTags('Consultations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  // ─── DOCTOR: Create a consultation ────────────────────────────────
  @Post()
  @Roles(RoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Doctor creates a consultation after an appointment' })
  @ApiResponse({ status: 201, description: 'Consultation created successfully' })
  async create(@Req() req: any, @Body() dto: CreateConsultationDTO) {
    const response = await this.consultationService.create(req.user._id, dto);
    return { data: response, message: 'Consultation created successfully' };
  }

  // ─── DOCTOR: Get all my own consultations ─────────────────────────
  @Get('my')
  @Roles(RoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Get all consultations for the logged-in doctor' })
  async getMyConsultations(@Req() req: any) {
    const response = await this.consultationService.getDoctorConsultations(req.user._id);
    return { data: response, message: 'Consultations fetched successfully' };
  }

  // ─── PATIENT: Get my own consultation history ─────────────────────
  // NEW — patient fetches their own consultations using JWT identity
  @Get('my/patient')
  @Roles(RoleEnum.PATIENT)
  @ApiOperation({ summary: 'Get all consultations for the logged-in patient' })
  async getMyPatientConsultations(@Req() req: any) {
    const response = await this.consultationService.getPatientConsultationsByUserId(req.user._id);
    return { data: response, message: 'Your consultations fetched successfully' };
  }

  // ─── ADMIN: Get all consultations ────────────────────────────────
  @Get()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Admin gets all consultations' })
  async getAll() {
    const response = await this.consultationService.getAll();
    return { data: response, message: 'Consultations fetched successfully' };
  }

  // ─── DOCTOR/ADMIN: Get one consultation ──────────────────────────
  // NOTE: this must come AFTER /my and /my/patient to avoid route conflict
  @Get(':id')
  @Roles(RoleEnum.DOCTOR, RoleEnum.ADMIN, RoleEnum.PATIENT)
  @ApiOperation({ summary: 'Get a single consultation by ID' })
  async getOne(@Param('id') id: string) {
    const response = await this.consultationService.getOne(id);
    return { data: response, message: 'Consultation fetched successfully' };
  }

  // ─── DOCTOR/ADMIN: Get patient consultation history by patientId ──
  @Get('patient/:patientId')
  @Roles(RoleEnum.DOCTOR, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get full consultation history for a patient' })
  async getPatientHistory(@Param('patientId') patientId: string) {
    const response = await this.consultationService.getPatientHistory(patientId);
    return { data: response, message: 'Patient history fetched successfully' };
  }
}