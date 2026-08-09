import { Controller, Get, UseGuards } from "@nestjs/common";
import { RecommendationService } from "../service/recommendation.service";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Recommendations')
@ApiResponse({status:401, description:'UNAUTHORIZED'})
@ApiResponse({status:500, description:'SERVER_ERROR'})
@Controller('recommendations')
export class RecommendationController{
    constructor(
        private readonly recommendationService: RecommendationService
    ){}

    @Get('home')
    @Roles(RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'personalized home feed recommendations, with trending fallback for new customers'})
    @ApiResponse({status: 200, description:'recommendations fetched successfully'})
    async getHomeFeed(
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.recommendationService.getHomeFeed(user)
        const message = i18n.t("common.RECOMMENDATION_READ")
        return {data:response, message}
    }

}