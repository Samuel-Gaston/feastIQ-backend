import { ApiProperty } from "@nestjs/swagger";
export class RevokePermissionDto {

  @ApiProperty({description:"permissions to revoke from a role and must be an array"})
  permissionIds?: string[];
}
