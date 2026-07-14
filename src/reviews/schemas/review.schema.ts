import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { RoleEnum } from "../../common/enums/role.enum";

@Schema({ timestamps: true })
export class Review extends Document {
  // Reviewer is the User who wrote the review (Doctor or Patient)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  reviewer?: User;

  // FIXED: store the name of the reviewer for display (populated from user)
  @Prop({ required: true })
  reviewerName?: string;

 @Prop({ required: true, enum: Object.values(RoleEnum) })
reviewerRole?: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating?: number;

  @Prop({ required: true, trim: true })
  comment?: string;

  @Prop({ default: true })
  isVisible?: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);