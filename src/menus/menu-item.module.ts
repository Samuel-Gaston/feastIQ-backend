import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MenuItem, MenuItemSchema } from "./schema/menu-item.schema";
import { Restaurant, RestaurantSchema } from "../restaurant/schema/restaurant.schema";
import { MenuItemService } from "./service/menu-item.service";
import { MenuItemController } from "./controller/menu-item.controller";


@Module({
    imports:[
       MongooseModule.forFeature([
        {name: MenuItem.name, schema:MenuItemSchema},
        {name: Restaurant.name, schema:RestaurantSchema},
       ]),
    ],
    providers:[MenuItemService],
    controllers:[MenuItemController],
    exports:[MenuItemService]
})
export class MenuItemModule{}