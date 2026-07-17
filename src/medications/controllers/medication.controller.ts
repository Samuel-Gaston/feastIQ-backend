import { Body, Controller, Get, Param, Post, Delete, Patch, UseGuards } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { MedicationService } from "../services/medication.service";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { PermissionCode } from "../../common/enums/permission.enum";
import { CreateMedicationDTO, UpdateMedicationDTO } from "../dtos/create-medication.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { Req } from "@nestjs/common";

@ApiTags('Medications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 404, description: 'NOT FOUND' })
@ApiResponse({ status: 400, description: 'BAD_REQUEST' })
@ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
@ApiResponse({ status: 403, description: 'FORBIDDEN' })
@ApiResponse({ status: 422, description: 'VALIDATION_FAILED' })
@ApiResponse({ status: 500, description: 'SERVER_ERROR' })
@Controller('medications')
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  // ─── Create medication under a prescription ────────────────────
  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
  @Permissions(PermissionCode.MEDICATION_CREATE)
  @ApiOperation({ summary: 'Create a medication linked to a prescription' })
  @ApiResponse({ status: 201, description: 'Medication created successfully' })
  async create(
    @Body() dto: CreateMedicationDTO,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.medicationService.createMedication(dto);
    const message = i18n.t("common.MEDICATION_CREATE");
    return { data: response, message };
  }

  // ─── Get all medications (admin) ──────────────────────────────
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
  @Permissions(PermissionCode.MEDICATION_READ)
  @ApiOperation({ summary: 'Get all medications' })
  async getAll(@I18n() i18n: I18nContext) {
    const response = await this.medicationService.getAllMedication();
    const message = i18n.t("common.MEDICATION_READ_ALL");
    return { data: response, message };
  }

 
  @Get('prescription/:prescriptionId')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR, RoleEnum.PATIENT)
  @Permissions(PermissionCode.MEDICATION_READ)
  @ApiOperation({ summary: 'Get all medications for a specific prescription' })
  async getByPrescription(
    @Param('prescriptionId') prescriptionId: string,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.medicationService.getMedicationsByPrescription(prescriptionId);
    const message = i18n.t("common.MEDICATION_READ_ALL");
    return { data: response, message };
  }

 


@Get('my/patient')
@Roles(RoleEnum.PATIENT)
@Permissions(PermissionCode.MEDICATION_READ)
@ApiOperation({ summary: 'Get all medications for the logged-in patient' })
@ApiResponse({ status: 200, description: 'Patient medications fetched successfully' })
async getMyMedications(
  @Req() req: any,
  @I18n() i18n: I18nContext,
) {
  const response = await this.medicationService.getMyMedications(req.user._id);
  const message = i18n.t('common.MEDICATION_READ_ALL');
  return { data: response, message };
}



 
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR, RoleEnum.PATIENT)
  @Permissions(PermissionCode.MEDICATION_READ)
  @ApiOperation({ summary: 'Get a single medication' })
  async getOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.medicationService.getMedication(id);
    const message = i18n.t("common.MEDICATION_READ_ONE");
    return { data: response, message };
  }

 
  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
  @Permissions(PermissionCode.MEDICATION_UPDATE) 
  @ApiOperation({ summary: 'Update a medication' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicationDTO,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.medicationService.updateMedication(id, dto);
    const message = i18n.t("common.MEDICATION_UPDATE");
    return { data: response, message };
  }


 
  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
  @Permissions(PermissionCode.MEDICATION_DELETE)
  @ApiOperation({ summary: 'Delete a medication' })
  async delete(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.medicationService.deleteMedication(id);
    const message = i18n.t("common.MEDICATION_DELETE");
    return { data: response, message };
  }
}