import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {RoleEnum} from '../../common/enums/role.enum';


@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true, })
  name?: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  isSystem?: boolean;

  @Prop({ default: true })
  isActive?: boolean;

  // Users assigned to this role
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  users?: Types.ObjectId[]; 

  // Permissions assigned to this role
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
  permissions?: Types.ObjectId[]; 
}

export const RoleSchema = SchemaFactory.createForClass(Role);