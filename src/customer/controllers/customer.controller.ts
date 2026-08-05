import { Body, Post,Get, Param, Patch, Delete, Controller, Req, UseGuards, HttpException, HttpStatus} from "@nestjs/common";
import { CustomerService } from "../services/customer.service";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateCustomerDTO } from "../dtos/create-customer.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { PermissionCode } from "../../common/enums/permission.enum";
import { UpdateCustomerDTO } from "../dtos/update-customer.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Customers')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 404, description: "ROLE_NOT_FOUND" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('customers')
export class CustomerController{
   constructor(
    private readonly customerService: CustomerService
   ){}

   @Post()
   @Roles(RoleEnum.ADMIN, RoleEnum.CUSTOMER)
   @Permissions(PermissionCode.CUSTOMER_CREATE)
   @ApiOperation({summary:"create a customer"})
   @ApiResponse({status:200, description:"customer created successfully"})
   async create(
    @Body() dto:CreateCustomerDTO,
    @I18n() i18n:I18nContext
   ){
    const response = await this.customerService.createCustomer(dto)
    const message = i18n.t("common.CUSTOMER_CREATED")
    return {data:response, message}
   }

   @Get()
   @Roles(RoleEnum.ADMIN)
   @Permissions(PermissionCode.CUSTOMER_READ)
   @ApiOperation({summary:"fetch all customers"})
   @ApiResponse({status:200, description:"customers fetched successfully"})
   async getAll(
    @I18n() i18n:I18nContext
   ){
    const response = await this.customerService.getAllCustomers()
    const message = i18n.t("common.CUSTOMER_READ")
    return {data:response, message}
   }

     @Get('me/customer-profile')
   @Roles(RoleEnum.ADMIN, RoleEnum.CUSTOMER)
   @ApiOperation({summary:'find a customer profile'})
    @ApiResponse({status:200, description:'customer profile found successfully'})
   async findMyCustomerProfile(
      @CurrentUser() user: User, 
     @I18n() i18n: I18nContext,
    ) {
     
     if (!user || !user._id) {
       throw new HttpException('Current user not found in request', HttpStatus.UNAUTHORIZED);
     }
   const response = await this.customerService.findCustomerProfile(user._id.toString());
   const message = i18n.t("common.READ_CUSTOMER_PROFILE");
   return { data: response, message };
   }

   @Patch('me/customer-profile')
    @Roles(RoleEnum.CUSTOMER, RoleEnum.ADMIN)
   async updateMyCUSTOMERProfile(
   @CurrentUser() user: User,
   @Body() dto:UpdateCustomerDTO,
   @I18n() i18n:I18nContext
   ){
      const response = await this.customerService.updateCustomer(user._id.toString(), dto)
      const message = i18n.t("common.UPDATE_CUSTOMER_PROFILE")
      return {data:response, message}
   }


   @Get(':id')
   @Roles(RoleEnum.ADMIN, RoleEnum.CUSTOMER)
   @Permissions(PermissionCode.CUSTOMER_READ_ONE)
   @ApiOperation({summary:"fetch one CUSTOMER by Id"})
   @ApiResponse({status:200, description:"CUSTOMER fetched successfully"})
   async getByID(
    @Param('id') id:string,
    @I18n() i18n:I18nContext
   ){
    const response = await this.customerService.getCustomerById(id)
    const message = i18n.t("common.CUSTOMER_READ_ONE")
    return {data:response, message}
   }

   @Patch(':id')
   @Roles(RoleEnum.ADMIN)
   @Permissions(PermissionCode.CUSTOMER_UPDATE)
   @ApiOperation({summary:"updated a CUSTOMER"})
   @ApiResponse({status:200, description:"CUSTOMER updated successfully"})
   async update(
    @Param('id') id:string,
    @I18n() i18n:I18nContext,
    @Body() dto:CreateCustomerDTO
   ){
    const response = await this.customerService.updateCustomer(id, dto)
    const message = i18n.t("common.CUSTOMER_UPDATE")
    return {data:response, message}
   }

   @Delete(':id')
   @Roles(RoleEnum.ADMIN)
   @Permissions(PermissionCode.CUSTOMER_DELETE)
   @ApiOperation({summary:"delete a CUSTOMER"})
   @ApiResponse({status:200, description:"CUSTOMER deleted successfully"})
   async delete(
    @Param('id') id:string,
    @I18n() i18n:I18nContext,
   ){
    const response = await this.customerService.deleteCustomer(id)
    const message = i18n.t("common.CUSTOMER_DELETED")
    return {data:response, message}
   }


}