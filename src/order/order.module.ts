import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./schema/order.schema";
import { Cart, CartSchema } from "../cart/schema/cart.schema";
import { Restaurant, RestaurantSchema } from "../restaurant/schema/restaurant.schema";
import { OrderService } from "./service/order.service";
import { OrderController } from "./controller/order.controller";
import { NotificationModule } from "../notification/notification.module";


@Module({
    imports:[
       MongooseModule.forFeature([
        {name: Order.name, schema:OrderSchema},
        {name: Cart.name, schema:CartSchema},
        {name: Restaurant.name, schema:RestaurantSchema},
       ]),
       NotificationModule
    ],
    providers:[OrderService],
    controllers:[OrderController],
    exports:[OrderService]
})
export class OrderModule{}