import { Body, Post,Get, Param, Patch, Delete, Controller, UseGuards} from "@nestjs/common";
import { DoctorService } from "../services/doctor.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateDoctorDto } from "../dtos/create-doctor.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { PermissionCode } from "../../common/enums/permission.enum";
import { UpdateDoctorDto } from "../dtos/update-doctor.dto";
import { UserService } from "../../user/services/user.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { HttpException, HttpStatus } from "@nestjs/common";


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Doctors')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 404, description: "ROLE_NOT_FOUND" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('doctors')
export class DoctorController{
   constructor(
    private readonly doctorservice: DoctorService,
  
   ){}

   @Post()
   @Roles(RoleEnum.ADMIN)
   @Permissions(PermissionCode.DOCTOR_CREATE)
   @ApiOperation({summary:"create a doctor"})
   @ApiResponse({status:200, description:"doctor created successfully"})
   async create(
    @Body() dto:CreateDoctorDto,
    @I18n() i18n:I18nContext
   ){
    const response = await this.doctorservice.createDoctor(dto)
    const message = i18n.t("common.DOCTOR_CREATED")
    return {data:response, message}
   }

   @Get()
   @Roles(RoleEnum.ADMIN, RoleEnum.DOCTOR, RoleEnum.PATIENT)
   @Permissions(PermissionCode.DOCTOR_READ)
   @ApiOperation({summary:"fetch all doctors"})
   @ApiResponse({status:200, description:"doctors fetched successfully"})
   async getAll(
    @I18n() i18n:I18nContext
   ){
    const response = await this.doctorservice.getAllDoctors()
    const message = i18n.t("common.DOCTOR_READ")
    return {data:response, message}
   }


   @Get('me/doctor-profile')
@Roles(RoleEnum.DOCTOR, RoleEnum.ADMIN)
@ApiOperation({summary:'find a doctor profile'})
@ApiResponse({status:200, description:'doctor profile found successfully'})
async findDoctorProfile(
  @CurrentUser() user: User, 
  @I18n() i18n: I18nContext,
) {
  // Safety Check
  if (!user || !user._id) {
    throw new HttpException('Current user not found in request', HttpStatus.UNAUTHORIZED);
  }

  const response = await this.doctorservice.findDoctorProfile(user._id.toString());
  const message = i18n.t("common.READ_DOCTOR_PROFILE");
  return { data: response, message };
}

     @Patch('me/update/doctor-profile')
     @Roles(RoleEnum.DOCTOR, RoleEnum.ADMIN)
     @ApiOperation({summary:"update profile information"})
     @ApiResponse({status:200, description:'profile information updated successfully'})
     async updateProfile(
      @CurrentUser() user: User,
      @Body() dto:UpdateDoctorDto,
      @I18n() i18n:I18nContext,
     ){
      const response = await this.doctorservice.updateDoctorProfile(user._id.toString(), dto)
      const message = i18n.t("common.UPDATED_DOCTOR_PROFILE")
      return {data:response, message}
     }


     @Get('me/patients')
@Roles(RoleEnum.DOCTOR)
@ApiOperation({ summary: "Fetch all patients linked to the currently logged-in doctor" })
@ApiResponse({ status: 200, description: "Patients fetched successfully" })
async getMyPatients(
  @CurrentUser() user: User,
  @I18n() i18n: I18nContext,
) {
  const response = await this.doctorservice.getMyPatients(user._id.toString());
  const message = i18n.t("common.PATIENT_LINKED_TO_DOCTOR");
  return { data: response, message };
}

   @Get(':id')
   @Roles(RoleEnum.ADMIN, RoleEnum.PATIENT)
   @Permissions(PermissionCode.DOCTOR_READ)
   @ApiOperation({summary:"fetch one doctor by Id"})
   @ApiResponse({status:200, description:"doctor fetched successfully"})
   async getByID(
    @Param('id') id:string,
    @I18n() i18n:I18nContext
   ){
    const response = await this.doctorservice.getDoctorById(id)
    const message = i18n.t("common.DOCTOR_READ_ONE")
    return {data:response, message}
   }

   @Patch(':id')
   @Roles(RoleEnum.ADMIN)
   @Permissions(PermissionCode.DOCTOR_READ)
   @ApiOperation({summary:"updated a doctor"})
   @ApiResponse({status:200, description:"doctor updated successfully"})
   async update(
    @Param('id') id:string,
    @I18n() i18n:I18nContext,
    @Body() dto:UpdateDoctorDto
   ){
    const response = await this.doctorservice.updatedDoctor(id, dto)
    const message = i18n.t("common.DOCTOR_UPDATE")
    return {data:response, message}
   }

   @Delete(':id')
   @Roles(RoleEnum.ADMIN)
   @Permissions(PermissionCode.DOCTOR_READ)
   @ApiOperation({summary:"delete a doctor"})
   @ApiResponse({status:200, description:"doctor deleted successfully"})
   async delete(
    @Param('id') id:string,
    @I18n() i18n:I18nContext,
   ){
    const response = await this.doctorservice.deleteDoctor(id)
    const message = i18n.t("common.DOCTOR_DELETED")
    return {data:response, message}
   }

     @Get(':id/patients')
     @Roles(RoleEnum.DOCTOR)
     @Permissions(PermissionCode.READ_DOCTOR_ASSIGN_TO_PATIENT)
     @ApiOperation({summary:'get all patients linked to a doctor'})
     @ApiResponse({status:200, description:'Patients linked to doctor fetched successfully'})
     async patientsLinkedToDoctor(
       @Param('id') id:string,
      @I18n() i18n:I18nContext,
     ){
      const response = await this.doctorservice.getPatientLinkedToDoctor(id)
      const message = i18n.t("common.PATIENT_LINKED_TO_DOCTOR")
      return {data:response, message}
     }

    
     


}