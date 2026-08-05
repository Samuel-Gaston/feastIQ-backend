import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Customer } from "../schemas/customer.schema";
import { Role } from "../../roles/schemas/role.schema";
import { Model } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { CreateCustomerDTO } from "../dtos/create-customer.dto";
import { RoleEnum } from "../../common/enums/role.enum";
import * as bcrypt from 'bcryptjs'
import { MailService } from "../../common/mail/mail.service";
import {Types} from "mongoose"

@Injectable()
export class CustomerService{
    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<Customer>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>,

        @InjectModel(User.name)
        private readonly userModel: Model<User>,

         private readonly mailService: MailService,
   
    ){}


async createCustomer(dto: CreateCustomerDTO) {
  const { name, email, address, phone, password } = dto;

  const existingEmail = await this.customerModel.findOne({ email });
  if (existingEmail) {
    throw new HttpException("Customer with this email already exists", HttpStatus.CONFLICT);
  }
  if (!password) {
    throw new HttpException("Password is required", HttpStatus.BAD_REQUEST);
  }
  const CustomerRole = await this.roleModel.findOne({ name: RoleEnum.CUSTOMER });
  if (!CustomerRole) {
    throw new HttpException("Customer role not found", HttpStatus.NOT_FOUND);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await this.userModel.create({
    name,
    email,
    password: hashedPassword,
    isVerified: true,
    isActive: true,
    roles: CustomerRole._id,
  });

  const Customer = await this.customerModel.create({
    name,
    email,
    address,
    phone,
    user: user._id,
  });

  await Customer.populate({ path: 'user', populate: { path: 'roles' } });

  await this.mailService.sendCustomerWelcomeEmail({
    to: email!,
    name: name!,
    email: email!,
    password,
  });

  return Customer;
}
    

     async getAllCustomers(): Promise<Customer[]>{
        const Customers = await this.customerModel.find().populate({path:'user'}).populate({path:'role'});
        return Customers;
    }
        
        
    async getCustomerById(id:string): Promise<Customer>{
        const Customer = await this.customerModel.findById(id).populate({path:'user'}).populate({path:'role'});
        if(!Customer){
            throw new HttpException("Customer not found", HttpStatus.NOT_FOUND)
        }
        return Customer;
    }
  

    
async updateCustomer(id: string, dto: any): Promise<Customer> {
  const existCustomer = await this.customerModel.findById(id);
  if (!existCustomer) {
    throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
  }
 
  const updateData: any = {};
  if (dto.name)    updateData.name = dto.name;
  if (dto.email)   updateData.email = dto.email;
  if (dto.phone)   updateData.phone = dto.phone;
  if (dto.address) updateData.address = dto.address;
 
  const Customer = await this.customerModel.findByIdAndUpdate(
    id, updateData, { new: true }
  ).populate({ path: 'user', populate: { path: 'roles' } });
 
  if (!Customer) {
    throw new HttpException('Failed to update Customer', HttpStatus.INTERNAL_SERVER_ERROR);
  }
 
  const userUpdateData: any = {};
  if (dto.name)  userUpdateData.name = dto.name;
  if (dto.email) userUpdateData.email = dto.email;
 
  if (Object.keys(userUpdateData).length > 0 && existCustomer.user) {
    await this.userModel.findByIdAndUpdate(existCustomer.user.toString(), userUpdateData);
  }
 
  return Customer;
}



   async deleteCustomer(id: string): Promise<void> {
        const existCustomer = await this.customerModel.findById(id);
        if (!existCustomer) {
            throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
        }

    
        const Customer = await this.customerModel.findByIdAndDelete(id);
        if (!Customer) {
            throw new HttpException('Failed to delete Customer', HttpStatus.INTERNAL_SERVER_ERROR);
        }

  
        if (Customer.user) {
            await this.userModel.findByIdAndDelete(Customer.user);
        }
   }

    
      async findCustomerProfile(userId: string): Promise<Customer> {
       const Customer = await this.customerModel
      .findOne({ user: new Types.ObjectId(userId) })
       .populate('user') 
    .populate('roles'); 
     
      if (!Customer) {
      throw new HttpException('Customer profile not found', HttpStatus.NOT_FOUND);
      }
      

      return Customer;
    }

async updateCustomerProfile(id: string, dto: any): Promise<Customer> {
  const existCustomer = await this.customerModel
    .findOne({ user: new Types.ObjectId(id) })
    .exec();

  if (!existCustomer) {
    throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
  }


  const userUpdateData: any = {};
  if (dto.name) userUpdateData.name = dto.name;
  if (dto.email) userUpdateData.email = dto.email;
  if (dto.password) {
    userUpdateData.password = await bcrypt.hash(dto.password, 10);
  }

  if (Object.keys(userUpdateData).length > 0) {
    await this.userModel.findByIdAndUpdate(id, userUpdateData).exec();
  }
  const updateData = { ...dto };
  delete updateData.email; 
  
  const Customer = await this.customerModel
    .findByIdAndUpdate(existCustomer._id, updateData, { new: true })
    .populate({ path: 'user', populate: { path: 'roles' } })
    .populate({path: 'Customer'})
    .exec();

  if (!Customer) {
    throw new HttpException('Failed to update Customer profile', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  return Customer.toObject() as Customer;
}
 

  

}