import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class DishRatingInput{
    @ApiProperty({description:'enter the menu item id'})
    menuItem?:string;

    @ApiProperty({description:'enter the rating for this dish 1-5'})
    rating?:number;
}

export class CreateReviewDTO{
    @ApiProperty({description:'enter the order id this review is for'})
    orderId?:string;

    @ApiProperty({description:'enter the overall rating 1-5'})
    rating?:number;

    @ApiPropertyOptional({description:'enter your comment'})
    comment?:string;

    @ApiPropertyOptional({type: [DishRatingInput], description:'optional per-dish ratings'})
    dishRatings?:DishRatingInput[];
}