import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AppointmentService } from "../services/appointment.service";
import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "../../common/decorators/role.decorator";
import { Permissions } from "../../common/decorators/permission.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { PermissionCode } from "../../common/enums/permission.enum";
import { CreateAppointmentDTO } from "../dtos/create-appointment.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { User } from "../../user/schemas/user.schema";
import { CurrentUser } from "../../common/decorators/current-user.decorator";


@ApiTags('Appointments')

@Controller('appointments')
export class AppointmentController{
    constructor(
        private readonly appoinmentservice: AppointmentService
    ){}

    @Post()
    @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR)
    @Permissions(PermissionCode.APPOINTMENT_CREATE)
    @ApiOperation({summary:'Create a new appointment'})
    @ApiResponse({status:201, description:'The appointment has been successfully created.'})
    async create(
        @Body() dto: CreateAppointmentDTO,
        @I18n() i18n:I18nContext,
        @CurrentUser() user: User,
    ){
        const response = await this.appoinmentservice.createAppointment(user._id.toString(), dto)
        const message = i18n.t("common.APPOINTMENT_CREATED")
        return {data:response, message}
    }

    @Get('doctor/:doctorId')
    @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR)
    @Permissions(PermissionCode.APPOINTMENT_READ)
    @ApiOperation({summary:'Get all appointments for a specific doctor'})
    @ApiResponse({status:200, description:'List of appointments for the specified doctor.'})
    async getAllDoctorAppointments(
        @I18n() i18n:I18nContext,
        @Param('doctorId') doctorId:string
    ){
        const response = await this.appoinmentservice.getAllDoctorAppointments(doctorId)
        const message = i18n.t("common.DOCTOR_APPOINTMENTS_FETCHED")
        return {data:response, message}
    }

    @Get()
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.APPOINTMENT_READ)
    @ApiOperation({summary:'Get all appointments'})
    @ApiResponse({status:200, description:'List of all appointments.'})
    async getAllAppointments(
        @I18n() i18n:I18nContext,
    ){
        const response = await this.appoinmentservice.getAllAppointments()
        const message = i18n.t("common.APPOINTMENTS_FETCHED")
        return {data:response, message}
    }

    @Get(':id')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.APPOINTMENT_READ)
    @ApiOperation({summary:'Get a specific appointment by ID'})
    @ApiResponse({status:200, description:'The requested appointment.'})
    async getAppointmentById(
        @I18n() i18n:I18nContext,
        @Param('id') id:string
    ){
        const response = await this.appoinmentservice.getAppointmentById(id)
        const message = i18n.t("common.APPOINTMENT_FETCHED")
        return {data:response, message}
    }

    @Patch(':id')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.APPOINTMENT_UPDATE)
    @ApiOperation({summary:'Update a specific appointment by ID'})
    @ApiResponse({status:200, description:'The updated appointment.'})
    async updateAppointment(
        @I18n() i18n:I18nContext,
        @Param('id') id:string,
        @Body() dto: CreateAppointmentDTO
    ){
        const response = await this.appoinmentservice.updateAppointment(id, dto)
        const message = i18n.t("common.APPOINTMENT_UPDATED")
        return {data:response, message}
    }

    @Delete(':id')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.APPOINTMENT_DELETE)
    @ApiOperation({summary:'Delete a specific appointment by ID'})
    @ApiResponse({status:200, description:'The deleted appointment.'})
    async deleteAppointment(
        @I18n() i18n:I18nContext,
        @Param('id') id:string
    ){
        const response = await this.appoinmentservice.deleteAppointment(id)
        const message = i18n.t("common.APPOINTMENT_DELETED")
        return {data:response, message}
    }

}