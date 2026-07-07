import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDTO } from './create-role.dto';
import { IsBoolean, IsOptional } from 'class-validator';


export class UpdateRoleDto extends PartialType(CreateRoleDTO) {
     @IsOptional()
    @IsBoolean()
    isSystem?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
