import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty({ description: "Refresh token issued at login" })
  @IsNotEmpty()
  refreshToken!: string;
}