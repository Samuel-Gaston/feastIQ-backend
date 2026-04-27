import { ApiProperty } from "@nestjs/swagger";



export class CreateReviewDTO{
    @ApiProperty({description:'enter the patient id'})
    patient?:string;

    @ApiProperty({description:'enter the doctor id'})
    doctor?:string;

    @ApiProperty({description:'enter the rating'})
    rating?:string;

    @ApiProperty({description:'enter the comment'})
    comment?:string;

}