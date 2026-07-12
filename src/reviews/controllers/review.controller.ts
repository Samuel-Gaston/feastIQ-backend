// import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
// import { ApiTags } from "@nestjs/swagger";
// import { ReviewService } from "../services/review.service";
// import { CreateReviewDTO } from "../dtos/create-review.dto";
// import { I18n, I18nContext } from "nestjs-i18n";
// import { ApiOperation, ApiResponse } from "@nestjs/swagger";
// import { RoleEnum } from "../../common/enums/role.enum";
// import { Roles } from "../../common/decorators/role.decorator";
// import { PermissionCode } from "../../common/enums/permission.enum";
// import { Permissions } from "../../common/decorators/permission.decorator";
// import { CurrentUser } from "../../common/decorators/current-user.decorator";
// import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
// import { RolesGuard } from "../../common/guards/role.guard";
// import { JwtPayload } from "../../common/strategies/jwt.strategy";
// import { User } from "../../user/schemas/user.schema";

// @ApiTags('Reviews')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiResponse({status:404, description:'NOT FOUND'})
// @ApiResponse({ status: 400, description: "BAD_REQUEST" })
// @ApiResponse({ status: 401, description: "UNAUTHORIZED" })
// @ApiResponse({ status: 403, description: "FORBIDDEN" })
// @ApiResponse({ status: 404, description: "ROLE_NOT_FOUND" })
// @ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
// @ApiResponse({ status: 500, description: "SERVER_ERROR" })
// @Controller('reviews')
// export class ReviewController{
//     constructor(
//         private readonly reviewService: ReviewService
//     ){}

    
//   @Post()
// @Roles(RoleEnum.DOCTOR, RoleEnum.PATIENT)
// async create(
//     @Body() dto: CreateReviewDTO,
//     @CurrentUser() user: User,
//     @I18n() i18n: I18nContext
// ) {
//     const response = await this.reviewService.createReview(dto, user);
//     return {
//         data: response,
//         message: i18n.t("common.REVIEW_CREATE")
//     };
// }

    
//     @Get(':patientId')
//     @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN,RoleEnum.PATIENT)
//     @Permissions(PermissionCode.REVIEW_READ)
//     @ApiOperation({summary:'get your reviews'})
//     @ApiResponse({status:200, description:'review fetched successfully'})
//     async getPatientReview(
//         @Param('id') patientId: string,
//         @I18n() i18n: I18nContext
//     ){
//    const response = await this.reviewService.getReviewsByPatient(patientId)
//    const message = i18n.t("common.REVIEW_GET_PATIENT")
//    return {data: response, message}
//     }


//     @Get(':doctorId')
//     @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN, RoleEnum.DOCTOR)
//     @Permissions(PermissionCode.REVIEW_READ)
//     @ApiOperation({summary:'get your review'})
//     @ApiResponse({status:200, description:'review fetched successfully'})
//     async getDoctorReview(
//         @Param('id') doctorId:string,
//         @I18n() i18n: I18nContext
//     ){
//     const response = await this.reviewService.getReviewsByDoctor(doctorId)
//     const message = i18n.t("common.REVIEW_GET_DOCTOR")
//     return {data: response, message}
//     }




//     @Delete(':id')
//     @Roles(RoleEnum.ADMIN,RoleEnum.SUPER_ADMIN)
//     @Permissions(PermissionCode.REVIEW_READ)
//     @ApiOperation({summary:'delete a review'})
//     @ApiResponse({status:200, description:'review deleted successfully'})
//     async delete(
//     @Param('id') id: string,
//     @I18n() i18n: I18nContext
//     ){
//     const response = await this.reviewService.deleteReview(id)
//     const message = i18n.t("common.REVIEW_DELETE")
//     return {data: response, message}
//     }


// @Get()
// @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
// @Permissions(PermissionCode.REVIEW_READ)
// @ApiOperation({ summary: 'Get all reviews for admin dashboard' })
// @ApiResponse({ status: 200, description: 'Reviews fetched successfully' })
// async getAllReviews(@I18n() i18n: I18nContext) {
//   const response = await this.reviewService.getAllReviews();
//   const message = i18n.t("common.REVIEWS_FETCHED");
//   return { data: response, message };
// }

   


// }