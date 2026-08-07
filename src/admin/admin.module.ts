import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './service/admin.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Permission, PermissionSchema } from '../roles/schemas/permission.schema';
import { AuthModule } from '../auth/auth.module'; 
import { Restaurant, RestaurantSchema } from '../restaurant/schema/restaurant.schema';
import{ Customer, CustomerSchema } from '../customer/schemas/customer.schema';
import { Order, OrderSchema } from '../order/schema/order.schema';
import { AdminAnalyticsController } from './controller/admin-analytics.controller';
import { AdminAnalyticsService } from './service/admin-analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
       {name: Customer.name, schema:CustomerSchema},
       {name: Restaurant.name, schema:RestaurantSchema},
        {name: Order.name, schema:OrderSchema},
    ]),
    AuthModule, 
  ],
  controllers: [AdminController, AdminAnalyticsController],
  providers: [AdminService,AdminAnalyticsService],
  exports: [AdminService, AdminAnalyticsService],
})
export class AdminModule {}