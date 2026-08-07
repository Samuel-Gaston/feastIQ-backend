import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminAnalyticsService } from "../service/admin-analytics.service";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Admin')
@ApiResponse({status:401, description:'UNAUTHORIZED'})
@ApiResponse({status:403, description:'FORBIDDEN'})
@ApiResponse({status:500, description:'SERVER_ERROR'})
@Controller('admin')
export class AdminAnalyticsController{
    constructor(
        private readonly adminAnalyticsService: AdminAnalyticsService
    ){}

    @Get('analytics')
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({summary: 'platform KPIs: users, restaurants, orders today, GMV, top restaurants'})
    @ApiResponse({status: 200, description:'analytics fetched successfully'})
    async getOverview(
        @I18n() i18n: I18nContext
    ){
        const response = await this.adminAnalyticsService.getOverview()
        const message = i18n.t("common.ADMIN_ANALYTICS_READ")
        return {data:response, message}
    }

}