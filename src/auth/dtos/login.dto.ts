import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginDto{
    @ApiProperty({description:'Enter your email'})
    @IsNotEmpty({message:'Email is required'})
    email?:string;

    @ApiProperty({description:'Enter your password'})
    @IsNotEmpty({message:'Password is required'})
    password?:string;

}