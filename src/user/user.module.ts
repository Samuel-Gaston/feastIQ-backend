import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { Permission, PermissionSchema } from "../roles/schemas/permission.schema";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { MailService } from "../common/mail/mail.service";

@Module({
    imports:[
     MongooseModule.forFeature([{name:User.name, schema:UserSchema}]),
     MongooseModule.forFeature([{name:Role.name, schema:RoleSchema}]),
     MongooseModule.forFeature([{name:Permission.name, schema:PermissionSchema}]),
    ],
    providers:[UserService, MailService],
    controllers:[UserController],
    exports:[UserService, MailService]
})
export class UserModule{}