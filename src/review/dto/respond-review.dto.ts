import { ApiProperty } from "@nestjs/swagger";

export class RespondReviewDTO{
    @ApiProperty({description:'enter the restaurant owner response text'})
    text?:string;
}