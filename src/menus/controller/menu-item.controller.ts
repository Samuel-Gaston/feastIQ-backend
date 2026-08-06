import { Controller, Get, Param, Patch, Post, Delete, Body, UseGuards } from "@nestjs/common";
import { MenuItemService } from "../service/menu-item.service";
import { CreateMenuItemDTO } from "../dto/create-menu-item.dto";
import { UpdateMenuItemDTO } from "../dto/update-menu-item.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { PermissionCode } from "../../common/enums/permission.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { User } from "../../user/schemas/user.schema";
import { CurrentUser } from "../../common/decorators/current-user.decorator";


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Menu Items')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('menu-items')
export class MenuItemController{
    constructor(
        private readonly menuItemService: MenuItemService
    ){}


    @Post()
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT)
    @Permissions(PermissionCode.MENU_ITEM_CREATE)
    @ApiOperation({summary: 'add a new dish to a restaurant menu'})
    @ApiResponse({status: 200, description:'menu item created successfully'})
    async create(
        @Body() dto: CreateMenuItemDTO,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.menuItemService.create(dto, user)
        const message = i18n.t("common.MENU_ITEM_CREATED")
        return {data:response, message}
    }

    @Get('me/menu-items')
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT)
    @ApiOperation({summary:'fetch menu items for my own restaurant'})
    @ApiResponse({status:200, description:'menu items fetched successfully'})
    async getMine(
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.menuItemService.getMyMenuItems(user)
        const message = i18n.t("common.MENU_ITEM_READ")
        return {data:response, message}
    }

    @Get()
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.MENU_ITEM_READ)
    @ApiOperation({summary: 'fetch all menu items'})
    @ApiResponse({status: 200, description:'menu items fetched successfully'})
    async getAll(
        @I18n() i18n: I18nContext
    ){
        const response = await this.menuItemService.getAllMenuItems()
        const message = i18n.t("common.MENU_ITEM_READ")
        return {data:response, message}
    }

    @Get('restaurant/:restaurantId')
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT)
    @ApiOperation({summary:'fetch all menu items for one restaurant'})
    @ApiResponse({status:200, description:'menu items fetched successfully'})
    async getByRestaurant(
        @Param('restaurantId') restaurantId: string,
        @I18n() i18n: I18nContext
    ){
        const response = await this.menuItemService.getMenuItemsByRestaurant(restaurantId)
        const message = i18n.t("common.MENU_ITEM_READ")
        return {data:response, message}
    }

    @Get(":id")
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({summary:'fetch one menu item'})
    @ApiResponse({status:200, description:'menu item fetched successfully'})
    async getOne(
        @Param('id') id: string,
        @I18n() i18n:I18nContext
    ){
        const response = await this.menuItemService.getMenuItemById(id)
        const message = i18n.t("common.MENU_ITEM_READ_ONE")
        return {data:response, message}
    }

    @Patch(':id')
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT)
    @Permissions(PermissionCode.MENU_ITEM_UPDATE)
    @ApiOperation({summary:"update a menu item"})
    @ApiResponse({status:200, description:"menu item updated successfully"})
    async update(
        @Param('id') id:string,
        @I18n() i18n:I18nContext,
        @Body() dto:UpdateMenuItemDTO,
        @CurrentUser() user: User
    ){
        const response = await this.menuItemService.updateMenuItem(id, dto, user)
        const message = i18n.t("common.MENU_ITEM_UPDATE")
        return {data:response, message}
    }

    @Delete(':id')
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT)
    @Permissions(PermissionCode.MENU_ITEM_DELETE)
    @ApiOperation({summary:"delete a menu item"})
    @ApiResponse({status:200, description:"menu item deleted successfully"})
    async delete(
        @Param('id') id:string,
        @I18n() i18n:I18nContext,
    ){
        const response = await this.menuItemService.deleteMenuItem(id)
        const message = i18n.t("common.MENU_ITEM_DELETED")
        return {data:response, message}
    }

}