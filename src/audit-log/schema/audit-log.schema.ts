import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../user/schemas/user.schema";

@Schema({timestamps: true})
export class AuditLog extends Document{

    @Prop({ type: Types.ObjectId, ref: 'User', required: true})
    actor?: User

    @Prop()
    actorRole?:string;

    @Prop({required: true})
    action?:string;

    @Prop()
    targetId?:string;

    @Prop()
    ipAddress?:string;

}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog)