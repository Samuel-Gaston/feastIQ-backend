import { Prop } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";



export class CreateDoctorDto{

    @ApiProperty({description: "enter the doctor's name"})
    name?:string;
    
    @ApiProperty({description:"enter the doctor's email"})
    email?:string;

    @ApiProperty({description:"enter the doctor's phone number"})
    phone?:string;

    @ApiProperty({description:"enter the doctor's address"})
    address?:string;

    @ApiProperty({description:"enter the doctor's country"})
    country?:string;

    @ApiProperty({description:"enter the doctor's specialization"})
    specialization?:string;

    @ApiProperty({description:"enter the doctor's license number"})
    licenseNumber?:string;


}