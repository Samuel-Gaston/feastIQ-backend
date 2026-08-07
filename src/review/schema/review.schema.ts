import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Restaurant } from "../../restaurant/schema/restaurant.schema";
import { Order } from "../../order/schema/order.schema";

@Schema({_id: false})
export class OwnerResponse{

    @Prop()
    text?:string;

    @Prop({default: () => new Date()})
    respondedAt?:Date;

}

export const OwnerResponseSchema = SchemaFactory.createForClass(OwnerResponse)

@Schema({_id: false})
export class DishRating{

    @Prop({ type: Types.ObjectId, ref: 'MenuItem'})
    menuItem?:Types.ObjectId;

    @Prop()
    rating?:number;

}

export const DishRatingSchema = SchemaFactory.createForClass(DishRating)

@Schema({timestamps: true})
export class Review extends Document{

    @Prop({ type: Types.ObjectId, ref: 'User', required: true})
    customer?: User

    @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true})
    restaurant?: Restaurant

    @Prop({ type: Types.ObjectId, ref: 'Order', required: true, unique: true})
    order?: Order

    @Prop({required: true, min: 1, max: 5})
    rating?:number;

    @Prop()
    comment?:string;

    @Prop({type: [DishRatingSchema], default: []})
    dishRatings?:DishRating[];

    @Prop({type: OwnerResponseSchema})
    ownerResponse?:OwnerResponse;

}

export const ReviewSchema = SchemaFactory.createForClass(Review)