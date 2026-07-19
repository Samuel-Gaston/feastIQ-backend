import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminMessage, AdminMessageSchema } from "./schema/adminMessage.schema";
import { Patient, PatientSchema } from "../patient/schemas/patient.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { AdminMessageService } from "./service/adminMessage.service";
import { AdminMessageController } from "./controller/adminMessage.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminMessage.name, schema: AdminMessageSchema },
      { name: Patient.name,      schema: PatientSchema },
      { name: User.name,         schema: UserSchema },
    ]),
  ],
  providers: [AdminMessageService],
  controllers: [AdminMessageController],
  exports: [AdminMessageService],
})
export class AdminMessageModule {}