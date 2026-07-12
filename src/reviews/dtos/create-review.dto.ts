import { ApiProperty } from "@nestjs/swagger";


export class CreateReviewDTO {
  @ApiProperty({ example: 5 })
  rating?: number;

  @ApiProperty({
    example: "The platform is very easy to use."
  })
  comment?: string;
}