import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { MenuItemCategoryEnum } from "../../common/enums/menu-item-category.enum";
import { Restaurant } from "../../restaurant/schema/restaurant.schema";

@Schema({_id: false})
export class AiTag{

    @Prop()
    predictedCategory?:string;

    @Prop()
    confidence?:number;

}

export const AiTagSchema = SchemaFactory.createForClass(AiTag)

@Schema({timestamps: true})
export class MenuItem extends Document{

    @Prop()
    name?:string;

    @Prop()
    description?:string;

    @Prop()
    category?:MenuItemCategoryEnum;

    @Prop()
    price?:number;

    @Prop()
    photoUrl?:string;

    @Prop()
    tags?:string[];

    @Prop({type: AiTagSchema})
    aiTag?:AiTag;

    @Prop({default: true})
    isAvailable?:boolean;

    @Prop()
    prepTimeMinutes?:number;

    @Prop({ type: Types.ObjectId, ref: 'Restaurant'})
    restaurant?: Restaurant

}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem)