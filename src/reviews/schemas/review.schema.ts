import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Patient } from "../../patient/schemas/patient.schema";
import mongoose, { Types } from "mongoose";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { Document } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { RoleEnum } from "../../common/enums/role.enum";


@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  reviewer?: User;

  @Prop({ required: true, enum: RoleEnum })
  reviewerRole?: RoleEnum;

  @Prop({ required: true, min: 1, max: 5 })
  rating?: number;

  @Prop({ required: true, trim: true })
  comment?: string;

  @Prop({ default: true })
  isVisible?: boolean;
}


export const ReviewSchema = SchemaFactory.createForClass(Review);