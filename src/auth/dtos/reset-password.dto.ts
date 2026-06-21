import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty({ description: "Email address to send the reset link to" })
  @IsEmail()
  email?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: "Reset token received by email" })
  @IsNotEmpty()
  token?: string;

  @ApiProperty({ description: "New password" })
  @IsNotEmpty()
  @MinLength(2)
  newPassword?: string;
}