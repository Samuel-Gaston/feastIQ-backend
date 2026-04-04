import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { Patient } from "../../patient/schemas/patient.schema";
import { IsOptional } from "class-validator";

export class CreateUserDto{
     
    @ApiProperty({description:"The name of the user"})
    name?:string;

    @ApiProperty({description:"The email of the user"})
    email?:string;

    @ApiProperty({description:"The password of the user"})
    password?:string;

    @ApiProperty({description:"Indicates if the user is verified"})

    isVerified?:boolean;

    @ApiProperty({description:"Indicates if the user is active"})
    isActive?:boolean;

    @ApiPropertyOptional({description:"The role ID associated with the user"})
    @IsOptional()
    roleId?:string;

    @ApiPropertyOptional({description:"The permission IDs associated with the user"})
    @IsOptional()
    permissionIds?:string[];

    @ApiPropertyOptional({description:'the doctor name'})
    @IsOptional()
    doctor?:Doctor;

    @ApiPropertyOptional({description:"the patient name"})
    @IsOptional()
    patient?:Patient;



}

