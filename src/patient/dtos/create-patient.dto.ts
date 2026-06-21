import { Prop } from "@nestjs/mongoose";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";


export class CreatePatientDTO{
    @ApiProperty({description:'enter name'})
    @Prop({minlength:2, maxlength:50})
    name?:string;

    @ApiProperty({description:'enter email'})
     @Prop({minlength:2, maxlength:50})
    email?:string

    @ApiProperty({description:'enter password'})
   @Prop({minlength:2, maxlength:50})
    password?:string;

    @ApiPropertyOptional({description:'enter password'})
     @Prop({minlength:2, maxlength:50})
    phone?:string;

    @ApiPropertyOptional({description:'enter password'})
    @Prop({minlength:2, maxlength:50})
    address?:string;


}