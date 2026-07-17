import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { PrescriptionService } from "../services/prescription.service";
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { PermissionCode } from "../../common/enums/permission.enum";
import { CreatePrescriptionDTO, UpdatePrescriptionDTO } from "../dtos/create-prescription.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { RolesGuard } from "../../common/guards/role.guard";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Req } from "@nestjs/common";

@ApiTags('Prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 404, description: 'NOT FOUND' })
@ApiResponse({ status: 400, description: 'BAD_REQUEST' })
@ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
@ApiResponse({ status: 403, description: 'FORBIDDEN' })
@ApiResponse({ status: 422, description: 'VALIDATION_FAILED' })
@ApiResponse({ status: 500, description: 'SERVER_ERROR' })
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionservice: PrescriptionService) {}


  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR)
  @Permissions(PermissionCode.PRESCRIPTION_CREATE)
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  async create(
    @Body() dto: CreatePrescriptionDTO,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.prescriptionservice.createPrescription(dto);
    const message = i18n.t('common.PRESCRIPTION_CREATE');
    return { data: response, message };
  }

 
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionCode.PRESCRIPTION_READ)
  @ApiOperation({ summary: 'Get all prescriptions' })
  async getPrescriptions(@I18n() i18n: I18nContext) {
    const response = await this.prescriptionservice.getAllPrescriptions();
    const message = i18n.t('common.PRESCRIPTION_READ_ALL');
    return { data: response, message };
  }

 
  @Get('patient/:patientId')
  @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR, RoleEnum.PATIENT, RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionCode.PRESCRIPTION_READ)
  @ApiOperation({ summary: 'Get all prescriptions for a patient' })
  async getPatientPrescription(
    @Param('patientId') patientId: string,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.prescriptionservice.getAllPatientPrescritions(patientId);
    const message = i18n.t('common.PRESCRIPTION_PATIENT_READ');
    return { data: response, message };
  }


  @Get('my/patient')
@Roles(RoleEnum.PATIENT)
@ApiOperation({ summary: 'Get all prescriptions for the logged-in patient' })
@ApiResponse({ status: 200, description: 'Patient prescriptions fetched successfully' })
async getMyPrescriptions(
  @Req() req: any,
  @I18n() i18n: I18nContext,
) {
  const response = await this.prescriptionservice.getMyPrescriptions(req.user._id);
  const message = i18n.t('common.PRESCRIPTION_PATIENT_READ');
  return { data: response, message };
}

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR, RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionCode.PRESCRIPTION_READ)
  @ApiOperation({ summary: 'Get a single prescription' })
  async getPrescription(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.prescriptionservice.getPrescription(id);
    const message = i18n.t('common.PRESCRIPTION_READ_ONE');
    return { data: response, message };
  }


  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
  @Permissions(PermissionCode.PRESCRIPTION_READ)
  @ApiOperation({ summary: 'Update a prescription' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDTO, // ← FIXED: was missing body
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.prescriptionservice.UpdatePrescription(id, dto);
    const message = i18n.t('common.PRESCRIPTION_UPDATE');
    return { data: response, message };
  }

  // ─── Delete prescription ───────────────────────────────────────
  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
  @Permissions(PermissionCode.PRESCRIPTION_DELETE)
  @ApiOperation({ summary: 'Delete a prescription' })
  async delete(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.prescriptionservice.DeletePrescription(id);
    const message = i18n.t('common.PRESCRIPTION_DELETE');
    return { data: response, message };
  }
}
