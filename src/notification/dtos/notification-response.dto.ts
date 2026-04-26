import { ApiProperty } from '@nestjs/swagger';


export class NotificationResponseDto {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  title?: string;

  @ApiProperty()
  message?: string;

  @ApiProperty()
  isRead?: boolean;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty()
  isAdminOnly?: boolean;

  @ApiProperty()
  createdAt?: Date;
}
