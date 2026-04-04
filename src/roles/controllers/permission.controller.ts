import { Body, Controller, Post, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PermissionService } from "../services/permission.services";
import { CreatePermissionDTO } from "../dtos/create-permission.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { PermissionCode } from "../../common/enums/permission.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { AssignPermissionDTO } from "../dtos/assign-role.dto";
import { RevokePermissionDto } from "../dtos/revoke-role.dto";

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionController{

    constructor(
        private readonly permissionservice: PermissionService,
     
    ){}


    @Post()
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.PERMISSION_CREATE)
    @ApiOperation({summary:'creating permission'})
    @ApiResponse({status:201, description:'permission created successfully'})
    async create(
        @Body() dto: CreatePermissionDTO,
        @I18n() i18n:I18nContext
    ){
        const response = await this.permissionservice.createPermission(dto)
        const message = i18n.t("common.PERMISSION_CREATED")
        return {response, message }
    }


    @Get()
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.PERMISSION_READ)
    @ApiOperation({summary:'reading permission'})
    @ApiResponse({status:200, description:'permission read successfully'})
    async read(
        @I18n() i18n:I18nContext
    ){
        const response = await this.permissionservice.getAllPermissions()
        const message = i18n.t("common.PERMISSION_READ")
        return {response, message }
    }

    @Post('assign/user/:id')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.PERMISSION_ASSIGN_TO_USER)
    @ApiOperation({summary:'assigning permissions to a user'})
    @ApiResponse({status:200, description:'permissions assigned successfully'})
    async assignPermissionsToUser(
        @Param('id') userId:string,
        @Body() assignPermissionsDto: AssignPermissionDTO,
        @I18n() i18n:I18nContext
    ){
        const response = await this.permissionservice.assignPermissionsToUser(
            userId, 
            assignPermissionsDto)
        const message = i18n.t("common.PERMISSION_ASSIGNED_TO_USER")
        return {response, message }
}    
      

    @Get('user/:id/permission')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.PERMISSION_READ_USER_PERMISSIONS)
    @ApiOperation({summary:'reading user permissions'})
    @ApiResponse({status:200, description:'user permissions read successfully'})
    async getUserPermissions(
   @Param('id') userId:string,
   @I18n() i18n:I18nContext
    ){
   const response = await this.permissionservice.getAllUserPermission(userId)
   const message = i18n.t("common.PERMISSION_READ")
   return {response, message }
    }

    @Post('assign/role/:id')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.PERMISSION_ASSIGN_TO_ROLE)
    @ApiOperation({summary:'assigning permissions to a role'})
    @ApiResponse({status:200, description:'permissions assigned successfully'})
    async assignPermissionsToRole(
   @Param('id') roleId:string,
        @Body() assignPermissionsDto: AssignPermissionDTO,
        @I18n() i18n:I18nContext
    ){
      const response = await this.permissionservice.assignPermissionsToRole(
     roleId, 
     assignPermissionsDto)
     const message = i18n.t("common.PERMISSION_ASSIGNED_TO_ROLE")
     return {response, message }

}


  @Post('revoke/:id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionCode.PERMISSION_REVOKE_FROM_ROLE)
  @ApiOperation({ summary: "common.SUMMARY_REVOKE_PERMISSION" })
  @ApiResponse({ status: 201, description: "common.PERMISSION_REVOKED_DESC" })
  async revokePermissions(
    @Param('id') roleId: string,
    @Body() revokePermissionsDto: RevokePermissionDto,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.permissionservice.revokePermissions(
    roleId,
      revokePermissionsDto,
    );
    const message = i18n.t('common.PERMISSION_REVOKED');
    return {response, message}
  }

}