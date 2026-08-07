
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLog, AuditLogSchema } from "./schema/audit-log.schema";
import { AuditLogService } from "./service/audit-log.service";
import { AuditLogController } from "./controller/audit-log.controller";


@Module({
    imports:[
       MongooseModule.forFeature([
        {name: AuditLog.name, schema:AuditLogSchema},
       ]),
    ],
    providers:[AuditLogService],
    controllers:[AuditLogController],
    exports:[AuditLogService]
})
export class AuditLogModule{}