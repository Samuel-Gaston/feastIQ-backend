import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Review } from "../schema/review.schema";
import { Model, Types } from "mongoose";
import { Order } from "../../order/schema/order.schema";
import { Restaurant } from "../../restaurant/schema/restaurant.schema";
import { CreateReviewDTO } from "../dto/create-review.dto";
import { RespondReviewDTO } from "../dto/respond-review.dto";
import { HttpStatus } from "@nestjs/common";
import { User } from "../../user/schemas/user.schema";
import { OrderStatusEnum } from "../../common/enums/order-status.enum";
import { NotificationService } from "../../notification/service/notification.service";
import { NotificationTypeEnum } from "../../common/enums/notification-type.enum";


@Injectable()
export class ReviewService{
    constructor(
        @InjectModel(Review.name)
        private readonly reviewModel: Model<Review>,

        @InjectModel(Order.name)
        private readonly orderModel: Model<Order>,

        @InjectModel(Restaurant.name)
        private readonly restaurantModel: Model<Restaurant>,

        private readonly notificationService: NotificationService
    ){}


  async create(dto: CreateReviewDTO, user: User): Promise<Review>{
        if(!dto.orderId){
            throw new HttpException("orderId is required", HttpStatus.BAD_REQUEST)
        }
        if(!dto.rating || dto.rating < 1 || dto.rating > 5){
            throw new HttpException("rating must be between 1 and 5", HttpStatus.BAD_REQUEST)
        }

        const order = await this.orderModel.findById(dto.orderId)
        if(!order){
            throw new HttpException("Order not found", HttpStatus.NOT_FOUND)
        }
        if(order.customer?.toString() !== user._id.toString()){
            throw new HttpException("This is not your order", HttpStatus.FORBIDDEN)
        }
        if(order.status !== OrderStatusEnum.DELIVERED && order.status !== OrderStatusEnum.COMPLETED){
            throw new HttpException("You can only review a delivered order", HttpStatus.BAD_REQUEST)
        }

        const existingReview = await this.reviewModel.findOne({order: order._id})
        if(existingReview){
            throw new HttpException("You have already reviewed this order", HttpStatus.BAD_REQUEST)
        }

        const dishRatings = dto.dishRatings?.map(item => ({
            menuItem: item.menuItem ? new Types.ObjectId(item.menuItem) : undefined,
            rating: item.rating
        }))

        const review = await this.reviewModel.create({
            customer: user._id,
            restaurant: order.restaurant,
            order: order._id,
            rating: dto.rating,
            comment: dto.comment,
            dishRatings
        })

        await this.recalculateRestaurantRating(order.restaurant!.toString())

        await review.populate({path: 'customer'})
        await review.populate({path: 'restaurant'})
        return review
    }

    
    async getByRestaurant(restaurantId: string): Promise<Review[]>{
        const existRestaurant = await this.restaurantModel.findById(restaurantId)
        if(!existRestaurant){
            throw new HttpException("This restaurant does not exist", HttpStatus.NOT_FOUND)
        }
        const reviews = await this.reviewModel.find({restaurant: new Types.ObjectId(restaurantId)}).populate({path:'customer'})
        return reviews
    }

   async respond(id: string, dto: RespondReviewDTO, user: User): Promise<Review>{
        if(!dto.text){
            throw new HttpException("text is required", HttpStatus.BAD_REQUEST)
        }

        const review = await this.reviewModel.findById(id)
        if(!review){
            throw new HttpException("Review not found", HttpStatus.NOT_FOUND)
        }

        const restaurant = await this.restaurantModel.findOne({user: new Types.ObjectId(user._id.toString())})
        if(!restaurant){
            throw new HttpException("Restaurant profile not found for this user", HttpStatus.NOT_FOUND)
        }
        if(review.restaurant?.toString() !== restaurant._id.toString()){
            throw new HttpException("This review does not belong to your restaurant", HttpStatus.FORBIDDEN)
        }

        review.ownerResponse = {text: dto.text, respondedAt: new Date()}
        await review.save()

        if(review.customer){
            await this.notificationService.send(
                review.customer.toString(),
                "The restaurant replied to your review",
                dto.text,
                NotificationTypeEnum.SYSTEM
            )
        }

        return review
    }

    private async recalculateRestaurantRating(restaurantId: string): Promise<void>{
        const reviews = await this.reviewModel.find({restaurant: new Types.ObjectId(restaurantId)})
        const total = reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0)
        const average = reviews.length > 0 ? total / reviews.length : 0

        await this.restaurantModel.findByIdAndUpdate(restaurantId, {ratings: average.toFixed(1)})
    }

}