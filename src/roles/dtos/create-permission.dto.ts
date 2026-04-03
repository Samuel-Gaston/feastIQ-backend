import { Schema, Prop } from "@nestjs/mongoose";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PermissionCode } from "../../common/enums/permission.enum";


@Schema({timestamps:true})
export class CreatePermissionDTO{
    
    @ApiProperty({description:"The name of the permission"})
    @Prop()
    name?:string;

    @ApiPropertyOptional({description:"The description of the permission"})
    @Prop()
    description?:string;

    @ApiProperty({description:"The code of the permission"})
    @Prop()
    code?:PermissionCode;


}

