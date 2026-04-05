import { Body, Post,Get, Param, Patch, Delete, Controller, Req} from "@nestjs/common";
import { PatientService } from "../services/patient.service";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreatePatientDTO } from "../dtos/create-patient.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { PermissionCode } from "../../common/enums/permission.enum";
import { UpdatePatientDTO } from "../dtos/update-patient.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";



@ApiTags('Patients')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 404, description: "ROLE_NOT_FOUND" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('patients')
export class PatientController{
   constructor(
    private readonly patientservice: PatientService
   ){}

   @Post()
   @Roles(RoleEnum.PATIENT)
   @Permissions(PermissionCode.PATIENT_CREATE)
   @ApiOperation({summary:"create a patient"})
   @ApiResponse({status:200, description:"patient created successfully"})
   async create(
    @Body() dto:CreatePatientDTO,
    @I18n() i18n:I18nContext
   ){
    const response = await this.patientservice.createPatient(dto)
    const message = i18n.t("common.PATIENT_CREATED")
    return {data:response, message}
   }

   @Get()
   @Roles(RoleEnum.PATIENT)
   @Permissions(PermissionCode.PATIENT_READ)
   @ApiOperation({summary:"fetch all patients"})
   @ApiResponse({status:200, description:"patients fetched successfully"})
   async getAll(
    @I18n() i18n:I18nContext
   ){
    const response = await this.patientservice.getAllPatients()
    const message = i18n.t("common.PATIENT_READ")
    return {data:response, message}
   }

   @Get(':id')
   @Roles(RoleEnum.PATIENT)
   @Permissions(PermissionCode.PATIENT_READ_ONE)
   @ApiOperation({summary:"fetch one patient by Id"})
   @ApiResponse({status:200, description:"patient fetched successfully"})
   async getByID(
    @Param('id') id:string,
    @I18n() i18n:I18nContext
   ){
    const response = await this.patientservice.getPatientById(id)
    const message = i18n.t("common.PATIENT_READ_ONE")
    return {data:response, message}
   }

   @Patch(':id')
   @Roles(RoleEnum.PATIENT)
   @Permissions(PermissionCode.PATIENT_UPDATE)
   @ApiOperation({summary:"updated a patient"})
   @ApiResponse({status:200, description:"patient updated successfully"})
   async update(
    @Param('id') id:string,
    @I18n() i18n:I18nContext,
    @Body() dto:CreatePatientDTO
   ){
    const response = await this.patientservice.updatedPatient(id, dto)
    const message = i18n.t("common.PATIENT_UPDATE")
    return {data:response, message}
   }

   @Delete(':id')
   @Roles(RoleEnum.PATIENT)
   @Permissions(PermissionCode.PATIENT_DELETE)
   @ApiOperation({summary:"delete a patient"})
   @ApiResponse({status:200, description:"patient deleted successfully"})
   async delete(
    @Param('id') id:string,
    @I18n() i18n:I18nContext,
   ){
    const response = await this.patientservice.deletePatient(id)
    const message = i18n.t("common.PATIENT_DELETED")
    return {data:response, message}
   }

   @Get('me/patient-profile')
   @ApiOperation({summary:'find a patient profile'})
    @ApiResponse({status:200, description:'doctor profile found successfully'})
   async findMyPatientProfile(
   @Req() req,
   @I18n() i18n: I18nContext,
    ) {
   const userId = req.user._id;
   const response = await this.patientservice.findPatientProfile(userId);
   const message = i18n.t("common.READ_PATIENT_PROFILE");
   return { data: response, message };
   }

   @Patch('me/patient-profile')
   async updateMyPatientProfile(
   @CurrentUser() user: User,
   @Body() dto:UpdatePatientDTO,
   @I18n() i18n:I18nContext
   ){
      const response = await this.patientservice.updatePatientProfile(user._id.toString(), dto)
      const message = i18n.t("common.UPDATE_PATIENT_PROFILE")
      return {data:response, message}
   }

   @Post('link-patient-to-doctor/:patientId/:doctorId')
   @Roles(RoleEnum.ADMIN)
   @Permissions(PermissionCode.PATIENT_ASSIGN_TO_DOCTOR)
   @ApiOperation({summary:'Assign a patient to a doctor'})
   @ApiResponse({status:200, description:'Patient assigned to a Doctor done successfully'})
   async assignPatientToDoctor(
      @Param('patientId') patientId:string,
      @Param('doctorId') doctorId:string,
      @I18n() i18n: I18nContext,
   ){
      const response = await this.patientservice.LinkPatientToDoctor(patientId, doctorId)
      const message = i18n.t("common.PATIENT_ASSIGN_TO_DOCTOR")
      return {data:response, message}
   }

  

}