import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConsultationController } from "./controller/consultation.controller";
import { ConsultationService } from "./service/consultation.service";
import { Consultation, ConsultationSchema } from "./schema/consultation.schema";
import { AppoinmentModule } from "../appointment/appointment.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Consultation.name, schema: ConsultationSchema }]),
    AppoinmentModule 
  ],
  controllers: [ConsultationController],
  providers: [ConsultationService],
  exports: [ConsultationService] 
})
export class ConsultationModule {}