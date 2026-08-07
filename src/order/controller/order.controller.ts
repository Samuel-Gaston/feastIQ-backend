import { Controller, Get, Param, Patch, Post, Body, Query, UseGuards } from "@nestjs/common";
import { OrderService } from "../service/order.service";

import { CancelOrderDTO } from "../dtos/cancel-order.dto";
import { CreateOrderDTO } from "../dtos/create-order.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { PermissionCode } from "../../common/enums/permission.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { OrderStatusEnum } from "../../common/enums/order-status.enum";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";
import { UpdateOrderStatusDTO } from "../dtos/update-order-status.dto";


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Orders')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('orders')
export class OrderController{
    constructor(
        private readonly orderService: OrderService
    ){}


    @Post()
    @Roles(RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'place an order from the current cart (Cash on Delivery)'})
    @ApiResponse({status: 200, description:'order placed successfully'})
    async create(
        @Body() dto: CreateOrderDTO,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.orderService.placeOrder(dto, user)
        const message = i18n.t("common.ORDER_CREATED")
        return {data:response, message}
    }

    @Get('admin')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.ORDER_READ)
    @ApiOperation({summary: 'admin: view or search all orders platform-wide'})
    @ApiResponse({status: 200, description:'orders fetched successfully'})
    async getAllAdmin(
        @Query('status') status: OrderStatusEnum,
        @I18n() i18n: I18nContext
    ){
        const response = await this.orderService.getAllOrders(status)
        const message = i18n.t("common.ORDER_READ")
        return {data:response, message}
    }

    @Get()
    @Roles(RoleEnum.CUSTOMER, RoleEnum.RESTAURANT)
    @ApiOperation({summary: 'list orders for the current user'})
    @ApiResponse({status: 200, description:'orders fetched successfully'})
    async getMine(
        @Query('status') status: OrderStatusEnum,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.orderService.getMyOrders(user, status)
        const message = i18n.t("common.ORDER_READ")
        return {data:response, message}
    }

    @Get(':id')
    @Roles(RoleEnum.ADMIN, RoleEnum.CUSTOMER, RoleEnum.RESTAURANT)
    @ApiOperation({summary: 'get order detail with full status history'})
    @ApiResponse({status: 200, description:'order fetched successfully'})
    async getOne(
        @Param('id') id: string,
        @I18n() i18n: I18nContext
    ){
        const response = await this.orderService.getOrderById(id)
        const message = i18n.t("common.ORDER_READ_ONE")
        return {data:response, message}
    }

    @Patch(':id/status')
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT)
    @Permissions(PermissionCode.ORDER_UPDATE)
    @ApiOperation({summary: 'restaurant owner advances order status'})
    @ApiResponse({status: 200, description:'order status updated successfully'})
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDTO,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.orderService.updateStatus(id, dto.status!, user)
        const message = i18n.t("common.ORDER_UPDATE")
        return {data:response, message}
    }

    @Patch(':id/cancel')
    @Roles(RoleEnum.ADMIN, RoleEnum.CUSTOMER, RoleEnum.RESTAURANT)
    @ApiOperation({summary: 'cancel an order with a reason'})
    @ApiResponse({status: 200, description:'order cancelled successfully'})
    async cancel(
        @Param('id') id: string,
        @Body() dto: CancelOrderDTO,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.orderService.cancelOrder(id, dto.reason!, user)
        const message = i18n.t("common.ORDER_CANCELLED")
        return {data:response, message}
    }

}