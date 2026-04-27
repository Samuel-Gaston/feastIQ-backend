import { Body, Controller, Get, Param, Post, Delete, Patch } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiResponse, ApiOperation } from "@nestjs/swagger";
import { MedicationService } from "../services/medication.service";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { PermissionCode } from "../../common/enums/permission.enum";
import { CreateMedicationDTO } from "../dtos/create-medication.dto";
import { I18n, I18nContext } from "nestjs-i18n";






@ApiTags('Medications')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 404, description: "ROLE_NOT_FOUND" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('medications')
export class MedicationController{
    constructor(
        private readonly medicationService: MedicationService
    ){}



    @Post()
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
    @Permissions(PermissionCode.MEDICATION_CREATE)
    @ApiOperation({summary:'create a new medication'})
    @ApiResponse({status:200, description:'medication created successfully'})
    async create(
        @Body() dto:CreateMedicationDTO,
        @I18n() i18n: I18nContext
    ){
   const response = await this.medicationService.createMedication(dto)
   const message = i18n.t("common.MEDICATION_CREATE")
   return {data:response, message}
    }


    
    @Get(':id')
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
    @Permissions(PermissionCode.MEDICATION_READ)
    @ApiOperation({summary:'fetched this medication'})
    @ApiResponse({status:200, description:'medication fetched successfully'})
    async getOne(
        @Param('id') id:string,
        @I18n() i18n: I18nContext
    ){
   const response = await this.medicationService.getMedication(id)
   const message = i18n.t("common.MEDICATION_READ_ONE")
   return {data:response, message}
    }

    
    @Get()
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
    @Permissions(PermissionCode.MEDICATION_READ)
    @ApiOperation({summary:'fetch all medications'})
    @ApiResponse({status:200, description:'medication fetched successfully'})
    async getAll(
        @I18n() i18n: I18nContext
    ){
   const response = await this.medicationService.getAllMedication()
   const message = i18n.t("common.MEDICATION_READ_ALL")
   return {data:response, message}
    }


     @Delete(':id')
     @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
     @Permissions(PermissionCode.MEDICATION_DELETE)
     @ApiOperation({summary:'Delete this medication'})
     @ApiResponse({status:200, description:'medication deleted successfully'})
     async delete(
     @Param('id') id:string,
     @I18n() i18n:I18nContext
     ){
   const response = await this.medicationService.deleteMedication(id)
   const message = i18n.t("common.MEDICATION_DELETE")
   return {data:response, message}
     }
    
    
    
    @Patch(':id')
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
    @Permissions(PermissionCode.APPOINTMENT_READ)
    @ApiOperation({summary:'Update this medication'})
    @ApiResponse({status:200, description:'medication updated successfully'})
    async update(
    @Body() dto: CreateMedicationDTO,
    @Param('id') id:string,
    @I18n() i18n:I18nContext
    ){
   const response = await this.medicationService.updateMedication(id, dto)
   const message = i18n.t("common.MEDICATION_UPDATE")
   return {data:response, message}
     }


}