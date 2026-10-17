import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Customer } from "../../customer/schemas/customer.schema";
import { Restaurant } from "../../restaurant/schema/restaurant.schema";
import { Order } from "../../order/schema/order.schema";
import { Chat } from "../../chat/schema/chat.schema";
import { MenuItem } from "../../menus/schema/menu-item.schema";
import { RestaurantStatusEnum } from "../../common/enums/restaurant.status";
import { OrderStatusEnum } from "../../common/enums/order-status.enum";

const DAY_MS = 24 * 60 * 60 * 1000

@Injectable()
export class AdminAnalyticsService{
    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<Customer>,

        @InjectModel(Restaurant.name)
        private readonly restaurantModel: Model<Restaurant>,

        @InjectModel(Order.name)
        private readonly orderModel: Model<Order>,

        @InjectModel(Chat.name)
        private readonly chatModel: Model<Chat>,

        @InjectModel(MenuItem.name)
        private readonly menuItemModel: Model<MenuItem>,
    ){}


    private percentChange(current: number, previous: number): number | null{
        if(previous === 0){
            return current === 0 ? 0 : null
        }
        return Math.round(((current - previous) / previous) * 1000) / 10
    }

    private async windowCounts(model: Model<any>, filter: Record<string, any>, weekAgo: Date, twoWeeksAgo: Date){
        const [total, thisWeek, lastWeek] = await Promise.all([
            model.countDocuments(filter),
            model.countDocuments({...filter, createdAt: {$gte: weekAgo}}),
            model.countDocuments({...filter, createdAt: {$gte: twoWeeksAgo, $lt: weekAgo}})
        ])
        return {value: total, change: this.percentChange(thisWeek, lastWeek)}
    }

    private async countAssistantReplies(from?: Date, to?: Date): Promise<number>{
        const match: any = {"messages.role": "assistant"}
        if(from || to){
            match["messages.createdAt"] = {}
            if(from){
                match["messages.createdAt"].$gte = from
            }
            if(to){
                match["messages.createdAt"].$lt = to
            }
        }
        const result = await this.chatModel.aggregate([
            {$unwind: "$messages"},
            {$match: match},
            {$count: "count"}
        ])
        return result[0]?.count ?? 0
    }

    async getOverview(){
        const now = Date.now()
        const weekAgo = new Date(now - 7 * DAY_MS)
        const twoWeeksAgo = new Date(now - 14 * DAY_MS)

        const today = new Date()
        const startUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
        const startOfToday = new Date(startUTC)
        const volumeStart = new Date(startUTC - 6 * DAY_MS)

        const [
            customers,
            restaurants,
            orders,
            assistantTotal,
            assistantThisWeek,
            assistantLastWeek,
            dishesAutoTagged,
            ordersToday,
            gmvResult,
            topRestaurants,
            volumeRaw,
            recentOrders,
            recentRestaurants
        ] = await Promise.all([
            this.windowCounts(this.customerModel, {}, weekAgo, twoWeeksAgo),
            this.windowCounts(this.restaurantModel, {status: RestaurantStatusEnum.APPROVED}, weekAgo, twoWeeksAgo),
            this.windowCounts(this.orderModel, {}, weekAgo, twoWeeksAgo),
            this.countAssistantReplies(),
            this.countAssistantReplies(weekAgo),
            this.countAssistantReplies(twoWeeksAgo, weekAgo),
            this.menuItemModel.countDocuments({"aiTag.predictedCategory": {$exists: true}}),
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
            ]),
            this.orderModel.aggregate([
                {$match: {createdAt: {$gte: volumeStart}}},
                {$group: {_id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}}, count: {$sum: 1}}}
            ]),
            this.orderModel
                .find()
                .sort({createdAt: -1})
                .limit(10)
                .populate("customer", "name")
                .populate("restaurant", "name")
                .lean(),
            this.restaurantModel
                .find()
                .sort({createdAt: -1})
                .limit(5)
                .lean()
        ])

        const volumeMap = new Map<string, number>(
            volumeRaw.map((row: any) => [row._id, row.count] as [string, number])
        )
        const days = Array.from({length: 7}, (_, index) => {
            const date = new Date(startUTC - (6 - index) * DAY_MS).toISOString().slice(0, 10)
            return {date, count: volumeMap.get(date) ?? 0}
        })
        const volumeTotal = days.reduce((sum, day) => sum + day.count, 0)

        const recentActivity = [
            ...recentOrders.map((order: any) => ({
                id: String(order._id),
                type: "ORDER",
                actor: order.customer?.name ?? null,
                target: order.restaurant?.name ?? null,
                status: order.status,
                createdAt: order.createdAt
            })),
            ...recentRestaurants.map((restaurant: any) => ({
                id: String(restaurant._id),
                type: "RESTAURANT",
                actor: restaurant.name ?? null,
                target: null,
                status: restaurant.status,
                createdAt: restaurant.createdAt
            }))
        ]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 15)

        return {
            stats: {
                customers,
                restaurants,
                orders,
                aiReplies: {
                    value: assistantTotal,
                    change: this.percentChange(assistantThisWeek, assistantLastWeek)
                }
            },
            orderVolume: {
                days,
                dailyAverage: Math.round((volumeTotal / 7) * 10) / 10,
                changeVsLastWeek: orders.change
            },
            aiUsage: {
                assistantReplies: assistantTotal,
                dishesAutoTagged
            },
            recentActivity,
            ordersToday,
            gmv: gmvResult[0]?.gmv ?? 0,
            topRestaurants
        }
    }

}