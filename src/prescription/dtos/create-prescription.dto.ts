import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class CreatePrescriptionDTO{

    @ApiProperty({description:'enter the patient id'})
    @IsNotEmpty()
    patient?:string;

    @ApiProperty({description:'enter the doctor id'})
    @IsNotEmpty()
    doctor?:string;

    @ApiProperty({description:'enter appointment id'})
    @IsNotEmpty()
    appointment?:string;

    @ApiProperty({description:'enter medications id'})
    @IsNotEmpty()
    medication?:string;

    @ApiProperty({description:'enter issued date'})
    @IsNotEmpty()
    issuedAt?:Date

    @ApiProperty({description:'enter expires date'})
    @IsNotEmpty()
    expiresAt?:Date;


}