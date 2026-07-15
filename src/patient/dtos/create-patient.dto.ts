import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export class CreatePatientDTO {
  @ApiProperty({ description: 'enter name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: 'enter email' })
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({ description: 'enter password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password?: string;

  
  @ApiPropertyOptional({ description: 'enter phone number' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'enter address' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  address?: string;
}