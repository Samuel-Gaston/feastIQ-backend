import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class CreateRoleDTO {
 @ApiProperty({description:"The name of the role"})
  @Prop({ required: true })
  name?: string;

  @ApiProperty({description:"The description of the role"})
  @Prop({ required: true })
  description?: string;
 
 @ApiPropertyOptional({description: "The permissions associated with the role"})
  @Prop()
  permissionIds?: string[];

}


