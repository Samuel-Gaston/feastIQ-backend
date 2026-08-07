import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Restaurant } from "../../restaurant/schema/restaurant.schema";
import { Order } from "../../order/schema/order.schema";
import { OrderStatusEnum } from "../../common/enums/order-status.enum";
import { Customer } from "../../customer/schemas/customer.schema";

@Injectable()
export class AdminAnalyticsService{
    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<Customer>,

        @InjectModel(Restaurant.name)
        private readonly restaurantModel: Model<Restaurant>,

        @InjectModel(Order.name)
        private readonly orderModel: Model<Order>,
    ){}


    async getOverview(){
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const [totalUsers, totalRestaurants, ordersToday, gmvResult, topRestaurants] = await Promise.all([
            this.customerModel.countDocuments(),
            this.restaurantModel.countDocuments(),
            this.orderModel.countDocuments({createdAt: {$gte: startOfToday}}),
            this.orderModel.aggregate([
                {$match: {status: {$in: [OrderStatusEnum.DELIVERED, OrderStatusEnum.COMPLETED]}}},
                {$group: {_id: null, gmv: {$sum: "$total"}}}
            ]),
            this.orderModel.aggregate([
                {$match: {status: {$in: [OrderStatusEnum.DELIVERED, OrderStatusEnum.COMPLETED]}}},
                {$group: {_id: "$restaurant", orderCount: {$sum: 1}, revenue: {$sum: "$total"}}},
                {$sort: {orderCount: -1}},
                {$limit: 5},
                {$lookup: {from: "restaurants", localField: "_id", foreignField: "_id", as: "restaurant"}},
                {$unwind: "$restaurant"},
                {$project: {
                    _id: 0,
                    restaurantId: "$restaurant._id",
                    name: "$restaurant.name",
                    orderCount: 1,
                    revenue: 1
                }}
            ])
        ])

        return {
            totalUsers,
            totalRestaurants,
            ordersToday,
            gmv: gmvResult[0]?.gmv ?? 0,
            topRestaurants
        }
    }

}