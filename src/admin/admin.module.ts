import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Customer, CustomerSchema } from "../customer/schemas/customer.schema";
import { Restaurant, RestaurantSchema } from "../restaurant/schema/restaurant.schema";
import { Order, OrderSchema } from "../order/schema/order.schema";
import { Chat, ChatSchema } from "../chat/schema/chat.schema";
import { MenuItem, MenuItemSchema } from "../menus/schema/menu-item.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { Permission, PermissionSchema } from "../roles/schemas/permission.schema";
import { AuditLog, AuditLogSchema } from "../audit-log/schema/audit-log.schema";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { AdminAnalyticsService } from "./service/admin-analytics.service";
import { AdminAnalyticsController } from "./controller/admin-analytics.controller";
import { AdminService } from "./service/admin.service";
import { AdminController } from "./controller/admin.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    AuditLogModule,
  ],
  providers: [AdminAnalyticsService, AdminService],
  controllers: [AdminAnalyticsController, AdminController],
  exports: [AdminAnalyticsService, AdminService],
})
export class AdminModule {}