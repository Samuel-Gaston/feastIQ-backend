import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Review, ReviewSchema } from "./schema/review.schema";
import { Order, OrderSchema } from "../order/schema/order.schema";
import { Restaurant, RestaurantSchema } from "../restaurant/schema/restaurant.schema";
import { ReviewService } from "./service/review.service";
import { ReviewController } from "./controller/review.controller";
import { NotificationModule } from "../notification/notification.module";


@Module({
    imports:[
       MongooseModule.forFeature([
        {name: Review.name, schema:ReviewSchema},
        {name: Order.name, schema:OrderSchema},
        {name: Restaurant.name, schema:RestaurantSchema},
       ]),
       NotificationModule
    ],
    providers:[ReviewService],
    controllers:[ReviewController],
    exports:[ReviewService]
})
export class ReviewModule{}