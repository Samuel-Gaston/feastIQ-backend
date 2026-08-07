import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { OrderStatusEnum } from "../../common/enums/order-status.enum";
import { PaymentMethodEnum, PaymentStatusEnum } from "../../common/enums/payment.enum";
import { Restaurant } from "../../restaurant/schema/restaurant.schema";
import { Customer } from "../../customer/schemas/customer.schema";

@Schema({_id: false})
export class OrderItem{

    @Prop({ type: Types.ObjectId, ref: 'MenuItem', required: true})
    menuItem?:Types.ObjectId;

    @Prop()
    name?:string;

    @Prop()
    unitPrice?:number;

    @Prop()
    quantity?:number;

    @Prop()
    subtotal?:number;

}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem)


@Schema({_id: false})
export class OrderStatusEvent{

    @Prop()
    status?:OrderStatusEnum;

    @Prop({default: () => new Date()})
    timestamp?:Date;

}

export const OrderStatusEventSchema = SchemaFactory.createForClass(OrderStatusEvent)

@Schema({timestamps: true})
export class Order extends Document{

    @Prop({ type: Types.ObjectId, ref: 'Customer', required: true})
    customer?: Customer

    @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true})
    restaurant?: Restaurant

    @Prop({type: [OrderItemSchema], default: []})
    items?:OrderItem[];

    @Prop()
    deliveryAddress?:string;

    @Prop()
    subtotal?:number;

    @Prop({default: 0})
    deliveryFee?:number;

    @Prop()
    total?:number;

    @Prop({type: String, enum: OrderStatusEnum, default: OrderStatusEnum.PLACED})
    status?:OrderStatusEnum;

    @Prop({type: [OrderStatusEventSchema], default: []})
    statusHistory?:OrderStatusEvent[];

    @Prop({type: String, enum: PaymentMethodEnum, default: PaymentMethodEnum.COD})
    paymentMethod?:PaymentMethodEnum;

    @Prop({type: String, enum: PaymentStatusEnum, default: PaymentStatusEnum.PENDING})
    paymentStatus?:PaymentStatusEnum;

    @Prop()
    cancellationReason?:string;

}

export const OrderSchema = SchemaFactory.createForClass(Order)