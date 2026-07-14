import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

export class CreateReviewDTO {
  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating?: number;

  @ApiProperty({ example: "The platform is very easy to use." })
  @IsString()
  @IsNotEmpty()
  comment?: string;
}

export class UpdateReviewDTO {
  @ApiProperty({ example: 4, description: 'Updated rating from 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: "Updated feedback." })
  @IsString()
  comment?: string;
}