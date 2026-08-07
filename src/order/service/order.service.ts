import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Order } from "../schema/order.schema";
import { Model, Types } from "mongoose";
import { Cart } from "../../cart/schema/cart.schema";
import { Restaurant } from "../../restaurant/schema/restaurant.schema";
import { CreateOrderDTO } from "../dtos/create-order.dto";
import { HttpStatus } from "@nestjs/common";
import { User } from "../../user/schemas/user.schema";
import { RoleEnum } from "../../common/enums/role.enum";
import { OrderStatusEnum } from "../../common/enums/order-status.enum";
import { PaymentMethodEnum, PaymentStatusEnum } from "../../common/enums/payment.enum";
import { NotificationService } from "../../notification/service/notification.service";
import { NotificationTypeEnum } from "../../common/enums/notification-type.enum";


const ALLOWED_TRANSITIONS: Record<string, OrderStatusEnum[]> = {
    [OrderStatusEnum.PLACED]: [OrderStatusEnum.CONFIRMED, OrderStatusEnum.CANCELLED],
    [OrderStatusEnum.CONFIRMED]: [OrderStatusEnum.PREPARING, OrderStatusEnum.CANCELLED],
    [OrderStatusEnum.PREPARING]: [OrderStatusEnum.READY_FOR_PICKUP],
    [OrderStatusEnum.READY_FOR_PICKUP]: [OrderStatusEnum.OUT_FOR_DELIVERY],
    [OrderStatusEnum.OUT_FOR_DELIVERY]: [OrderStatusEnum.DELIVERED],
    [OrderStatusEnum.DELIVERED]: [OrderStatusEnum.COMPLETED],
    [OrderStatusEnum.COMPLETED]: [],
    [OrderStatusEnum.CANCELLED]: [],
}

@Injectable()
export class OrderService{
    constructor(
        @InjectModel(Order.name)
        private readonly orderModel: Model<Order>,

        @InjectModel(Cart.name)
        private readonly cartModel: Model<Cart>,

        @InjectModel(Restaurant.name)
        private readonly restaurantModel: Model<Restaurant>,

        private readonly notificationService: NotificationService
    ){}


    private async getRestaurantForOwner(user: User): Promise<Restaurant>{
        const restaurant = await this.restaurantModel.findOne({user: new Types.ObjectId(user._id.toString())})
        if(!restaurant){
            throw new HttpException("Restaurant profile not found for this user", HttpStatus.NOT_FOUND)
        }
        return restaurant
    }

  async placeOrder(dto: CreateOrderDTO, user: User): Promise<Order>{
        const cart = await this.cartModel.findOne({customer: new Types.ObjectId(user._id.toString())})
        if(!cart || !cart.items || cart.items.length === 0){
            throw new HttpException("Your cart is empty", HttpStatus.BAD_REQUEST)
        }
        if(!cart.restaurant){
            throw new HttpException("Your cart has no restaurant attached", HttpStatus.BAD_REQUEST)
        }
        if(!dto.deliveryAddress){
            throw new HttpException("deliveryAddress is required", HttpStatus.BAD_REQUEST)
        }

        const items = cart.items.map(item => ({
            menuItem: item.menuItem,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: (item.unitPrice ?? 0) * (item.quantity ?? 0)
        }))

        const subtotal = items.reduce((sum, item) => sum + (item.subtotal ?? 0), 0)
        const deliveryFee = 0
        const total = subtotal + deliveryFee

        const order = await this.orderModel.create({
            customer: user._id,
            restaurant: cart.restaurant,
            items,
            deliveryAddress: dto.deliveryAddress,
            subtotal,
            deliveryFee,
            total,
            status: OrderStatusEnum.PLACED,
            statusHistory: [{status: OrderStatusEnum.PLACED, timestamp: new Date()}],
            paymentMethod: PaymentMethodEnum.COD,
            paymentStatus: PaymentStatusEnum.PENDING
        })

        cart.items = []
        cart.restaurant = undefined
        await cart.save()

        await order.populate({path: 'restaurant'})

        const restaurant = await this.restaurantModel.findById(order.restaurant)
        if(restaurant?.user){
            await this.notificationService.send(
                restaurant.user.toString(),
                "New order received",
                `You have a new order worth ${total}`,
                NotificationTypeEnum.ORDER
            )
        }

        return order
    }

    async getMyOrders(user: User, status?: OrderStatusEnum): Promise<Order[]>{
        const filter: any = {}

        if(user.roles?.name === RoleEnum.RESTAURANT){
            const restaurant = await this.getRestaurantForOwner(user)
            filter.restaurant = restaurant._id
        } else {
            filter.customer = new Types.ObjectId(user._id.toString())
        }

        if(status){
            filter.status = status
        }

        const orders = await this.orderModel.find(filter).populate({path:'restaurant'}).populate({path:'customer'})
        return orders
    }

    async getAllOrders(status?: OrderStatusEnum): Promise<Order[]>{
        const filter: any = {}
        if(status){
            filter.status = status
        }
        const orders = await this.orderModel.find(filter).populate({path:'restaurant'}).populate({path:'customer'})
        return orders
    }

    async getOrderById(id: string): Promise<Order>{
        const order = await this.orderModel.findById(id).populate({path:'restaurant'}).populate({path:'customer'})
        if(!order){
            throw new HttpException("Order not found", HttpStatus.NOT_FOUND)
        }
        return order
    }

   async updateStatus(id: string, status: OrderStatusEnum, user: User): Promise<Order>{
        const order = await this.orderModel.findById(id)
        if(!order){
            throw new HttpException("Order not found", HttpStatus.NOT_FOUND)
        }

        if(user.roles?.name === RoleEnum.RESTAURANT){
            const restaurant = await this.getRestaurantForOwner(user)
            if(order.restaurant?.toString() !== restaurant._id.toString()){
                throw new HttpException("This order does not belong to your restaurant", HttpStatus.FORBIDDEN)
            }
        }

        const currentStatus = order.status ?? OrderStatusEnum.PLACED
        const allowedNext = ALLOWED_TRANSITIONS[currentStatus] ?? []
        if(!allowedNext.includes(status)){
            throw new HttpException(`Cannot move order from ${currentStatus} to ${status}`, HttpStatus.BAD_REQUEST)
        }

        order.status = status
        order.statusHistory = [...(order.statusHistory ?? []), {status, timestamp: new Date()}]

        if(status === OrderStatusEnum.DELIVERED){
            order.paymentStatus = PaymentStatusEnum.PAID
        }

        await order.save()
        await order.populate({path: 'restaurant'})

        if(order.customer){
            await this.notificationService.send(
                order.customer.toString(),
                "Order update",
                `Your order status changed to ${status}`,
                NotificationTypeEnum.ORDER
            )
        }

        return order
    }

  async cancelOrder(id: string, reason: string, user: User): Promise<Order>{
        const order = await this.orderModel.findById(id)
        if(!order){
            throw new HttpException("Order not found", HttpStatus.NOT_FOUND)
        }

        if(user.roles?.name === RoleEnum.CUSTOMER && order.customer?.toString() !== user._id.toString()){
            throw new HttpException("This is not your order", HttpStatus.FORBIDDEN)
        }
        if(user.roles?.name === RoleEnum.RESTAURANT){
            const restaurant = await this.getRestaurantForOwner(user)
            if(order.restaurant?.toString() !== restaurant._id.toString()){
                throw new HttpException("This order does not belong to your restaurant", HttpStatus.FORBIDDEN)
            }
        }

        const currentStatus = order.status ?? OrderStatusEnum.PLACED
        if(![OrderStatusEnum.PLACED, OrderStatusEnum.CONFIRMED].includes(currentStatus)){
            throw new HttpException("This order can no longer be cancelled", HttpStatus.BAD_REQUEST)
        }

        order.status = OrderStatusEnum.CANCELLED
        order.cancellationReason = reason
        order.statusHistory = [...(order.statusHistory ?? []), {status: OrderStatusEnum.CANCELLED, timestamp: new Date()}]

        await order.save()

        if(user.roles?.name === RoleEnum.CUSTOMER){
            const restaurant = await this.restaurantModel.findById(order.restaurant)
            if(restaurant?.user){
                await this.notificationService.send(restaurant.user.toString(), "Order cancelled", reason, NotificationTypeEnum.ORDER)
            }
        } else if(order.customer){
            await this.notificationService.send(order.customer.toString(), "Order cancelled", reason, NotificationTypeEnum.ORDER)
        }

        return order
    }

}