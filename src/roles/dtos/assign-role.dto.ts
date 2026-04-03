import { Schema, Prop } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema({timestamps: true})
export class AssignPermissionDTO{
    @ApiProperty({description:'assigning permissions to a user'})
    @Prop()
    permissionIds?:string[];
}

