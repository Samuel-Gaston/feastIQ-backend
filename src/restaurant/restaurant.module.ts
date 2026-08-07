import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { MailModule } from "../common/mail/mail.module";
import { Restaurant, RestaurantSchema } from "./schema/restaurant.schema";
import { RestaurantService } from "./service/restaurant.service";
import { RestaurantController } from "./controller/restaurant.controller";
import { NotificationModule } from "../notification/notification.module";
import { AuditLogModule } from "../audit-log/audit-log.module";

@Module({
    imports:[
       MongooseModule.forFeature([
        {name: Restaurant.name, schema:RestaurantSchema},
        {name: Role.name, schema:RoleSchema},
        {name: User.name, schema:UserSchema},
       ]) ,
  MailModule,
  NotificationModule,
  AuditLogModule],
    providers:[RestaurantService],
    controllers:[RestaurantController],
    exports:[RestaurantService]
})
export class RestaurantModule{}