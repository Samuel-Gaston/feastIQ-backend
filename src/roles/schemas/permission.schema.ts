import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PermissionCode } from '../../common/enums/permission.enum';

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ required: true })
  name?: string;

  @Prop({ required: true, unique: true, enum: PermissionCode })
  code?: PermissionCode;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive?: boolean;

  // Roles that have this permission
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }] })
  roles?: Types.ObjectId[];

  // Users that have this permission
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  users?: Types.ObjectId[];
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);