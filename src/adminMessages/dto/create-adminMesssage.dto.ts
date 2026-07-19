import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

// Patient sends a message to admin
export class SendMessageDTO {
  @ApiProperty({ description: 'Message content (text only)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content?: string;
}

// Admin replies to a patient thread
export class AdminReplyDTO {
  @ApiProperty({ description: 'Admin reply content (text only)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content?: string;
}