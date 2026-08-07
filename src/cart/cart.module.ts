import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Cart, CartSchema } from "./schema/cart.schema";
import { MenuItem, MenuItemSchema } from "../menus/schema/menu-item.schema";
import { CartService } from "./service/cart.service";
import { CartController } from "./controller/cart.controller";


@Module({
    imports:[
       MongooseModule.forFeature([
        {name: Cart.name, schema:CartSchema},
        {name: MenuItem.name, schema:MenuItemSchema},
       ]),
    ],
    providers:[CartService],
    controllers:[CartController],
    exports:[CartService]
})
export class CartModule{}