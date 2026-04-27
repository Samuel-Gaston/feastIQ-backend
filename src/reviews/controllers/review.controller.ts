import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ReviewService } from "../services/review.service";
import { CreateReviewDTO } from "../dtos/create-review.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RoleEnum } from "../../common/enums/role.enum";
import { Roles } from "../../common/decorators/role.decorator";
import { PermissionCode } from "../../common/enums/permission.enum";
import { Permissions } from "../../common/decorators/permission.decorator";



@ApiTags('Reviews')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 404, description: "ROLE_NOT_FOUND" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('reviews')
export class ReviewController{
    constructor(
        private readonly reviewService: ReviewService
    ){}

    
    @Post()
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR, RoleEnum.PATIENT)
    @Permissions(PermissionCode.REVIEW_READ)
    @ApiOperation({summary:'create a review'})
    @ApiResponse({status:200, description:'review created successfully'})
    async create(
        @Body() dto: CreateReviewDTO,
        @I18n() i18n: I18nContext
    ){
    const response = await this.reviewService.createReview(dto)
    const message = i18n.t("common.REVIEW_CREATE")
    return {data: response, message}
    }

    
    @Get(':patientId')
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN,RoleEnum.PATIENT)
    @Permissions(PermissionCode.REVIEW_READ)
    @ApiOperation({summary:'get your reviews'})
    @ApiResponse({status:200, description:'review fetched successfully'})
    async getPatientReview(
        @Param('id') patientId: string,
        @I18n() i18n: I18nContext
    ){
   const response = await this.reviewService.getReviewsByPatient(patientId)
   const message = i18n.t("common.REVIEW_GET_PATIENT")
   return {data: response, message}
    }


    @Get(':doctorId')
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
    @Permissions(PermissionCode.REVIEW_READ)
    @ApiOperation({summary:'get your review'})
    @ApiResponse({status:200, description:'review fetched successfully'})
    async getDoctorReview(
        @Param('id') doctorId:string,
        @I18n() i18n: I18nContext
    ){
    const response = await this.reviewService.getReviewsByDoctor(doctorId)
    const message = i18n.t("common.REVIEW_GET_DOCTOR")
    return {data: response, message}
    }


    @Get(':id')
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN)
    @Permissions(PermissionCode.REVIEW_READ)
    @ApiOperation({summary:'get a review'})
    @ApiResponse({status:200, description:'review fetched successfully'})
    async getOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext
    ){
     const response = await this.reviewService.getReviewsByDoctor(id)
    const message = i18n.t("common.REVIEW_GET_ONE")
    return {data: response, message}
    }


    @Delete(':id')
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN)
    @Permissions(PermissionCode.REVIEW_READ)
    @ApiOperation({summary:'delete a review'})
    @ApiResponse({status:200, description:'review deleted successfully'})
    async delete(
    @Param('id') id: string,
    @I18n() i18n: I18nContext
    ){
    const response = await this.reviewService.deleteReview(id)
    const message = i18n.t("common.REVIEW_DELETE")
    return {data: response, message}
    }

    @Patch(':id')
    @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN)
    @Permissions(PermissionCode.REVIEW_READ)
    @ApiOperation({summary:'update a review'})
    @ApiResponse({status:200, description:'review updated successfully'})
    async updated(
    @Body() dto: CreateReviewDTO,
    @Param('id') id: string,
    @I18n() i18n: I18nContext
    ) {
    const response = await this.reviewService.updateReview(id, dto)
    const message = i18n.t("common.REVIEW_UPDATE")
    return {data: response, message}
    }


}