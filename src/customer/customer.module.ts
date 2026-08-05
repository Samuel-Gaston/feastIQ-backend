import { Module } from "@nestjs/common";
import { Customer, CustomerSchema } from "./schemas/customer.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Role, RoleSchema } from "../roles/schemas/role.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { CustomerController } from "./controllers/customer.controller";
import { MailModule } from "../common/mail/mail.module";
import { CustomerService } from "./services/customer.service";


@Module({
    imports:[
       MongooseModule.forFeature([
        {name: Customer.name, schema:CustomerSchema},
        {name: Role.name, schema:RoleSchema},
        {name: User.name, schema:UserSchema},
       ]) ,
  MailModule],
    providers:[CustomerService],
    controllers:[CustomerController],
    exports:[CustomerService]
})
export class CustomerModule{}