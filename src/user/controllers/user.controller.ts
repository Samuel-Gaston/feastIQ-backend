import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { PermissionCode } from "../../common/enums/permission.enum";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "../dtos/create-user.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Permissions } from "../../common/decorators/permission.decorator";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { User } from "../schemas/user.schema";
import { CurrentUser } from "../../common/decorators/current-user.decorator";




@ApiTags('Users')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 404, description: "ROLE_NOT_FOUND" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('users')
export class UserController{
    constructor(
        private readonly userservice:UserService,
    ){}


    @Post()
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.USER_CREATE)
    @ApiOperation({summary:'create a new user'})
    @ApiResponse({status:200, description:'user created successfully'})
    async create(
        @Body() dto:CreateUserDto,
        @I18n() i18n:I18nContext,
    ){
        const response = await this.userservice.createUser(dto)
        const message = i18n.t("common.USER_CREATE")
        return {data:response, message}
    }


    @Get()
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.USER_READ)
    @ApiOperation({summary:'get all users'})
    @ApiResponse({status:200, description:'users retrieved successfully'})
    async findAll(
        @I18n() i18n:I18nContext,
    ){
        const response = await this.userservice.findAllUser()
        const message = i18n.t("common.USER_READ")
        return {data:response, message}
    }
    

    @Get(':id')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.USER_READ)
    @ApiOperation({summary:'find a user by id'})
    @ApiResponse({status:200, description:'user with this id found successfully'})
    async findOne(
        @Param('id') id: string,
        @I18n() i18n:I18nContext,
    ){
        const response = await this.userservice.findOneUser(id)
        const message = i18n.t("common.USER_READ_ONE")
        return {data:response, message}
    }

    @Delete(':id')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.USER_DELETE)
    @ApiOperation({summary:'delete a user'})
    @ApiResponse({status:200, description:'user deleted successfully'})
    async delete(
        @Param('id') id: string,
        @I18n() i18n:I18nContext,
    ){
        const response = await this.userservice.DeleteUser(id)
        const message = i18n.t("common.USER_DELETE")
        return {data:response, message}
    }

    @Get('user/:email')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.USER_READ)
    @ApiOperation({summary:'find a user by email'})
    @ApiResponse({status:200, description:'user with this email found successfully'})
    async findByEmail(
        @Param('email') email: string,
        @I18n() i18n:I18nContext,
    ){
        const response = await this.userservice.findUserByEmail(email)
        const message = i18n.t("common.USER_READ_EMAIL")
        return {data:response, message}
    }
    

    @Patch(':id')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.USER_UPDATE)
    @ApiOperation({summary:'update a user'})
    @ApiResponse({status:200, description:'user updated successfully'})
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
        @I18n() i18n:I18nContext,
    ){
        const response = await this.userservice.updateUser(id, dto)
        const message = i18n.t("common.USER_UPDATE")
        return {data:response, message}
    }

    @Post(':id/activate')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.USER_UPDATE)
    @ApiOperation({summary:'activate a user'})
    @ApiResponse({status:200, description:'user activated successfully'})
    async activate(
        @Param('id') id: string,
        @I18n() i18n:I18nContext,
    ){
        const response = await this.userservice.activateUserAccount(id)
        const message = i18n.t("common.USER_ACTIVATE")
        return {data:response, message}
    }

  

   



   


}