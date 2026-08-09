import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { Restaurant, RestaurantSchema } from "../restaurant/schema/restaurant.schema";
import { MenuItem, MenuItemSchema } from "../menus/schema/menu-item.schema";
import { SeedService } from "./seedRestaurant.service";


@Module({
    imports:[
       MongooseModule.forFeature([
        {name: User.name, schema:UserSchema},
        {name: Role.name, schema:RoleSchema},
        {name: Restaurant.name, schema:RestaurantSchema},
        {name: MenuItem.name, schema:MenuItemSchema},
       ]),
    ],
    providers:[SeedService],
})
export class SeedModule{}