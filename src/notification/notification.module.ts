import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Notification, NotificationSchema } from "./schema/notification.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { NotificationService } from "./service/notification.service";
import { NotificationController } from "./controller/notification.controller";


@Module({
    imports:[
       MongooseModule.forFeature([
        {name: Notification.name, schema:NotificationSchema},
        {name: User.name, schema:UserSchema},
        {name: Role.name, schema:RoleSchema},
       ]),
    ],
    providers:[NotificationService],
    controllers:[NotificationController],
    exports:[NotificationService]
})
export class NotificationModule{}