import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Role, RoleSchema } from "./schemas/role.schema";
import {Permission, PermissionSchema} from "./schemas/permission.schema";
import { RoleService } from "./services/roles.services";
import { RoleController } from "./controllers/roles.controller";
import { PermissionService } from "./services/permission.services";
import { PermissionController } from "./controllers/permission.controller";
import { UserSchema } from "../user/schemas/user.schema";
import { User } from "../user/schemas/user.schema";


@Module({
    imports:[
        MongooseModule.forFeature([
            {name:Role.name, schema:RoleSchema,}, 
            {name:Permission.name, schema:PermissionSchema},
          { name: User.name, schema: UserSchema },])
    ],
    providers:[RoleService, PermissionService],
    controllers:[RoleController, PermissionController],
    exports:[RoleService],
})

export class RolesModule{}