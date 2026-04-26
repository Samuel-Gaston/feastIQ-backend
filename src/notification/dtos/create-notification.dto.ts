import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { RoleEnum } from '../../common/enums/role.enum';

export class CreateNotificationDto {
  @ApiProperty({ description: 'The title of the notification' })
  title?: string;

  @ApiProperty({ description: 'The message of the notification' })
  message?: string;

  @ApiProperty({ description: 'The type of the notification', required: false })
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'If the notification is only for admins', default: false })
  @IsOptional()
  isAdminOnly?: boolean;

  @ApiProperty({ description: 'The roles this notification is for', type: [String], enum: RoleEnum, required: false })
  roles?: RoleEnum[];

  @ApiProperty({ description: 'The ID of the user to notify', required: false })
 @IsOptional()
  userId?: string;
}
