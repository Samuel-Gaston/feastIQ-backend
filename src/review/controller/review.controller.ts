import { Controller, Get, Param, Post, Body, Query, UseGuards } from "@nestjs/common";
import { ReviewService } from "../service/review.service";
import { CreateReviewDTO } from "../dto/create-review.dto";
import { RespondReviewDTO } from "../dto/respond-review.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Reviews')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('reviews')
export class ReviewController{
    constructor(
        private readonly reviewService: ReviewService
    ){}


    @Post()
    @Roles(RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'submit a review for a delivered order'})
    @ApiResponse({status: 200, description:'review submitted successfully'})
    async create(
        @Body() dto: CreateReviewDTO,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.reviewService.create(dto, user)
        const message = i18n.t("common.REVIEW_CREATED")
        return {data:response, message}
    }

    @Get()
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT, RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'list reviews for a restaurant'})
    @ApiResponse({status: 200, description:'reviews fetched successfully'})
    async getByRestaurant(
        @Query('restaurantId') restaurantId: string,
        @I18n() i18n: I18nContext
    ){
        const response = await this.reviewService.getByRestaurant(restaurantId)
        const message = i18n.t("common.REVIEW_READ")
        return {data:response, message}
    }

    @Post(':id/response')
    @Roles(RoleEnum.RESTAURANT)
    @ApiOperation({summary: 'restaurant owner responds to a review'})
    @ApiResponse({status: 200, description:'response submitted successfully'})
    async respond(
        @Param('id') id: string,
        @Body() dto: RespondReviewDTO,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.reviewService.respond(id, dto, user)
        const message = i18n.t("common.REVIEW_RESPONSE_ADDED")
        return {data:response, message}
    }

}