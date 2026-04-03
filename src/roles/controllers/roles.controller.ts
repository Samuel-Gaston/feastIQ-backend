import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { RoleService } from "../services/roles.services";
import { CreateRoleDTO } from "../dtos/create-role.dto";
import { I18nContext, I18n } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { Permissions } from "../../common/decorators/permission.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { PermissionCode } from "../../common/enums/permission.enum";


@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 404, description: "ROLE_NOT_FOUND" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@ApiTags('Roles')
@Controller('roles')
export class RoleController{
     constructor(
        private readonly roleService: RoleService
     ){}

    @Post()
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.ROLE_CREATE)
    @ApiOperation({summary:'create a new role'})
    @ApiResponse({ status: 201, description: 'Role created successfully.'})
    async create(
        @Body() dto: CreateRoleDTO,
        @I18n() i18n: I18nContext
    ){
       const response = await this.roleService.createRole(dto);
       const message =  i18n.t("common.ROLE_CREATED")
       return {response, message};
    }

    @Get()
   @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.ROLE_READ)
    @ApiOperation({summary:'Get all roles'})
    @ApiResponse({status:201, description:'roles fetched successfully'})
    async getAll(
        @I18n() i18n: I18nContext
    ){
        const response = await this.roleService.getAllRoles();
        const message = i18n.t("common.ROLE_FETCHED")
        return {response, message};
    }

    @Get(':id')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.ROLE_READ)
    @ApiOperation({summary:'Get a role by id'})
    @ApiResponse({status:200, description:'Role fetched successfully'})
    async getOne(
        @Param('id') id:string,
        @I18n() i18n:I18nContext
    ){
      const response = await this.roleService.getRoleById(id);
      const message = i18n.t("common.ROLE_FETCHED")
      return {response, message};
     }

     @Get(':id/permission')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.ROLE_READ_PERMISSIONS)
     @ApiOperation({summary:'getting all permissions for a role'})
     @ApiResponse({status:201, description:'Permission fetched successfully'})
     async getPermissions(
        @Param('id') id:string,
        @I18n() i18n:I18nContext
     ){
         const response = await this.roleService.getPermissionsForRole(id);
         const message = i18n.t("common.ROLEPERMISSION_FETCHED")
         return {response, message}
     }


     @Patch(':id')
     @Roles(RoleEnum.ADMIN)
     @Permissions(PermissionCode.ROLE_UPDATE)
     @ApiOperation({summary:'updating a role'})
     @ApiResponse({status:200, description:'role updated successfully'})
     async update(
        @Param('id') id:string,
        @Body() dto:CreateRoleDTO,
        @I18n() i18n:I18nContext
     ){
      const response = await this.roleService.updateRole(id, {
        name:dto.name,
        description:dto.description,
      })
      const message = i18n.t("common.UPDATED_ROLE")
      return {response, message}
     }


     @Delete(':id')
     @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.ROLE_DELETE)
     @ApiOperation({summary:'deleteing a role'})
     @ApiResponse({description:'Role deleted successfully'})
     async delete(
        @Param('id') id:string, 
        @I18n() i18n:I18nContext,
     ){
        const response = await this.roleService.remove(id)
        const message = i18n.t("common.DELETED_ROLE")
        return {response, message}
     }


        
    

}