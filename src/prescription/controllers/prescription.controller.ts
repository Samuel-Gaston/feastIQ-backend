import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { PrescriptionService } from "../services/prescription.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { PermissionCode } from "../../common/enums/permission.enum";
import { CreatePrescriptionDTO } from "../dtos/create-prescription.dto";
import { I18n, I18nContext } from "nestjs-i18n";



@ApiTags('Prescriptions')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 404, description: "ROLE_NOT_FOUND" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('prescriptions')
export class PrescriptionController{
    constructor(
        private readonly prescriptionservice: PrescriptionService
    ){}


    @Post()
    @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR)
    @Permissions(PermissionCode.APPOINTMENT_CREATE)
    @ApiOperation({summary:'Create a new prescription'})
    @ApiResponse({status:201, description:'prescription created successfully'})
    async create(
        @Body() dto: CreatePrescriptionDTO,
        @I18n() i18n:I18nContext
    ){
        const response = await this.prescriptionservice.createPrescription(dto)
        const message = i18n.t("common.PRESCRIPTION_CREATE")
        return {data:response, message}
    }


    @Get(':patientId')
    @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR, RoleEnum.PATIENT, RoleEnum.SUPER_ADMIN)
    @Permissions(PermissionCode.APPOINTMENT_READ)
    @ApiOperation({summary:'get all prescription for a patient'})
    @ApiResponse({status:200, description:'Patient prescription fetched successfully'})
    async getPatientPrescription(
        @Param('patientId') patientId:string,
        @I18n() i18n:I18nContext
    ){
        const response = await this.prescriptionservice.getAllPatientPrescritions(patientId)
        const message = i18n.t("common.PRESCRIPTION_PATIENT_READ")
        return {data:response, message}
    }

     @Get(':id')
    @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR,RoleEnum.SUPER_ADMIN)
    @Permissions(PermissionCode.APPOINTMENT_READ)
    @ApiOperation({summary:'get a prescription'})
    @ApiResponse({status:200, description:'Prescription fetched successfully'})
    async getPrescription(
        @Param('id') id:string,
        @I18n() i18n:I18nContext
    ){
        const response = await this.prescriptionservice.getPrescription(id)
        const message = i18n.t("common.PRESCRIPTION_READ_ONE")
        return {data:response, message}
    }


    @Get()
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN)
    @Permissions(PermissionCode.APPOINTMENT_READ)
    @ApiOperation({summary:'get all prescriptions'})
    @ApiResponse({status:200, description:'Prescription fetched successfully'})
    async getPrescriptions(
        @I18n() i18n:I18nContext
    ){
        const response = await this.prescriptionservice.getAllPrescriptions()
        const message = i18n.t("common.PRESCRIPTION_READ_ALL")
        return {data:response, message}
    }



    @Delete(':id')
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
    @Permissions(PermissionCode.APPOINTMENT_READ)
    @ApiOperation({summary:'Delete this prescription'})
    @ApiResponse({status:200, description:'Prescription deleted successfully'})
    async delete(
        @Param('id') id:string,
        @I18n() i18n:I18nContext
    ){
        const response = await this.prescriptionservice.DeletePrescription(id)
        const message = i18n.t("common.PRESCRIPTION_DELETE")
        return {data:response, message}
    }



    @Patch(':id')
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
    @Permissions(PermissionCode.APPOINTMENT_READ)
    @ApiOperation({summary:'Update this prescription'})
    @ApiResponse({status:200, description:'Prescription updated successfully'})
    async update(
        @Param('id') id:string,
        @I18n() i18n:I18nContext
    ){
        const response = await this.prescriptionservice.UpdatePrescription(id)
        const message = i18n.t("common.PRESCRIPTION_UPDATE")
        return {data:response, message}
    }







}