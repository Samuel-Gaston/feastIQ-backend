import { Controller, Get, Param, Patch, Post, Delete, Body, UseGuards } from "@nestjs/common";
import { CartService } from "../service/cart.service";
import { AddCartItemDTO } from "../dtos/add-cart-item.dto";
import { UpdateCartItemDTO } from "../dtos/update-cart-item.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Cart')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('cart')
export class CartController{
    constructor(
        private readonly cartService: CartService
    ){}


    @Get()
    @Roles(RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'get the current customer cart'})
    @ApiResponse({status: 200, description:'cart fetched successfully'})
    async getMyCart(
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.cartService.getMyCart(user)
        const message = i18n.t("common.CART_READ")
        return {data:response, message}
    }

    @Post('items')
    @Roles(RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'add a dish to the cart'})
    @ApiResponse({status: 200, description:'item added to cart successfully'})
    async addItem(
        @Body() dto: AddCartItemDTO,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.cartService.addItem(dto, user)
        const message = i18n.t("common.CART_ITEM_ADDED")
        return {data:response, message}
    }

    @Patch('items/:menuItemId')
    @Roles(RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'update quantity of a cart item'})
    @ApiResponse({status: 200, description:'cart item updated successfully'})
    async updateItem(
        @Param('menuItemId') menuItemId: string,
        @Body() dto: UpdateCartItemDTO,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.cartService.updateItem(menuItemId, dto, user)
        const message = i18n.t("common.CART_ITEM_UPDATED")
        return {data:response, message}
    }

    @Delete('items/:menuItemId')
    @Roles(RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'remove an item from the cart'})
    @ApiResponse({status: 200, description:'cart item removed successfully'})
    async removeItem(
        @Param('menuItemId') menuItemId: string,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.cartService.removeItem(menuItemId, user)
        const message = i18n.t("common.CART_ITEM_REMOVED")
        return {data:response, message}
    }

    @Delete()
    @Roles(RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'clear the cart'})
    @ApiResponse({status: 200, description:'cart cleared successfully'})
    async clearCart(
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        await this.cartService.clearCart(user)
        const message = i18n.t("common.CART_CLEARED")
        return {data:null, message}
    }

}