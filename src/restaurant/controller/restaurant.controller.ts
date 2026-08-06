import { Controller, Get, Param, Patch, Post, Delete } from "@nestjs/common";
import { RestaurantService } from "../service/restaurant.service";
import { CreateRestaurantDTO } from "../dto/create-restaurant.dto";
import { Body } from "@nestjs/common";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { PermissionCode } from "../../common/enums/permission.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ApiTags } from "@nestjs/swagger";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";
import { UpdateRestaurantDTO } from "../dto/update-restaurant.dto";
import { UpdateRestaurantStatusDTO } from "../dto/update-restaurant-status.dto";



@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Restaurants')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 404, description: "ROLE_NOT_FOUND" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('restaurants')
export class RestaurantController{
    constructor(
        private readonly restaurantService: RestaurantService
    ){}


    @Post()
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT)
    @Permissions(PermissionCode.RESTAURANT_CREATE)
    @ApiOperation({summary: 'create a new restaurant'})
    @ApiResponse({status: 200, description:'restaurant created successfully'})
    async create(
        @Body() dto: CreateRestaurantDTO,
        @I18n() i18n: I18nContext
    ){
        const response = await this.restaurantService.create(dto)
        const message = i18n.t("common.RESTAURANT_CREATED")
        return {data:response, message}
    }

    @Get()
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.RESTAURANT_READ)
    @ApiOperation({summary: 'fetch all restaurants'})
    @ApiResponse({status: 200, description:'restaurant fetched successfully'})
    async getAll(
        @I18n() i18n: I18nContext
    ){
        const response = await this.restaurantService.getAllRestaurants()
        const message = i18n.t("common.RESTAURANT_READ")
        return {data:response, message}
    }

    @Get('me/restaurant-profile')
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT)
    @ApiOperation({summary:'get restaurant profile'})
    @ApiResponse({status:200, description:' profile fetched successfully'})
    async getProfile(
       @CurrentUser() user: User,
       @I18n() i18n: I18nContext
    ){
        const response = await this.restaurantService.findRestaurantProfile(user._id.toString())
        const message = i18n.t("common.READ_CUSTOMER_PROFILE")
        return {data:response, message}
    }

    @Patch('me/restaurant-profile')
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT)
    @ApiOperation({summary:'update restaurant profile'})
    @ApiResponse({status:200, description:' profile updated successfully'})
    async updateProfile(
        @CurrentUser() user: User,
        @Body() dto: UpdateRestaurantDTO,
        @I18n() i18n: I18nContext
    ){
        const response = await this.restaurantService.updateRestaurantProfile(user._id.toString(), dto)
        const message  = i18n.t("common.UPDATE_CUSTOMER_PROFILE")
        return {data:response, message}
    }

    @Patch(':id/status')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.RESTAURANT_UPDATE)
    @ApiOperation({summary:"approve or suspend a restaurant"})
    @ApiResponse({status:200, description:"restaurant status updated successfully"})
    async updateStatus(
        @Param('id') id:string,
        @Body() dto: UpdateRestaurantStatusDTO,
        @I18n() i18n:I18nContext
    ){
        const response = await this.restaurantService.updateRestaurantStatus(id, dto.status!)
        const message = i18n.t("common.RESTAURANT_UPDATE")
        return {data:response, message}
    }

    @Get(":id")
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({summary:'fetch one restaurant'})
    @ApiResponse({status:200, description:'restaurant fetched successfully'})
    async getOne(
        @Param('id') id: string,
        @I18n() i18n:I18nContext
    ){
        const response = await this.restaurantService.getRestaurantById(id)
        const message = i18n.t("common.CUSTOMER_READ_ONE")
        return {data:response, message}
    }

       @Patch(':id')
       @Roles(RoleEnum.ADMIN)
       @Permissions(PermissionCode.RESTAURANT_UPDATE)
       @ApiOperation({summary:"updated a restaurant"})
       @ApiResponse({status:200, description:"restaurant updated successfully"})
       async update(
        @Param('id') id:string,
        @I18n() i18n:I18nContext,
        @Body() dto:CreateRestaurantDTO
       ){
        const response = await this.restaurantService.updateRestaurant(id, dto)
        const message = i18n.t("common.RESTAURANT_UPDATE")
        return {data:response, message}
       }
    
       @Delete(':id')
       @Roles(RoleEnum.ADMIN)
       @Permissions(PermissionCode.RESTAURANT_DELETE)
       @ApiOperation({summary:"delete a restaurant"})
       @ApiResponse({status:200, description:"restaurant deleted successfully"})
       async delete(
        @Param('id') id:string,
        @I18n() i18n:I18nContext,
       ){
        const response = await this.restaurantService.deleteRestaurant(id)
        const message = i18n.t("common.RESTAURANT_DELETED")
        return {data:response, message}
       }


}