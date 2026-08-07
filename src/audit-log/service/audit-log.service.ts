import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuditLog } from "../schema/audit-log.schema";
import { Model, Types } from "mongoose";

@Injectable()
export class AuditLogService{
    constructor(
        @InjectModel(AuditLog.name)
        private readonly auditLogModel: Model<AuditLog>,
    ){}

    async log(actorId: string, actorRole: string, action: string, targetId?: string, ipAddress?: string): Promise<AuditLog>{
        return this.auditLogModel.create({
            actor: new Types.ObjectId(actorId),
            actorRole,
            action,
            targetId,
            ipAddress
        })
    }

    async getAll(): Promise<AuditLog[]>{
        return this.auditLogModel.find().sort({createdAt: -1}).populate({path:'actor'})
    }

}