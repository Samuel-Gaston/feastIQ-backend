import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Restaurant } from "../schema/restaurant.schema";
import { Model } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Role } from "../../roles/schemas/role.schema";
import { CreateRestaurantDTO } from "../dto/create-restaurant.dto";
import { HttpStatus } from "@nestjs/common";
import { RoleEnum } from "../../common/enums/role.enum";
import * as bcrypt from 'bcrypt'
import { RestaurantStatusEnum } from "../../common/enums/restaurant.status";
import { MailService } from "../../common/mail/mail.service";
import { Types } from "mongoose";


@Injectable()
export class RestaurantService{
    constructor(
        @InjectModel(Restaurant.name)
        private readonly restaurantModel: Model<Restaurant>,

        @InjectModel(User.name)
        private readonly userModel: Model<User>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>,

        private readonly mailService: MailService
    ){}


    async create(dto: CreateRestaurantDTO): Promise<Restaurant>{
        const {name, email, password, description, cuisineTags,address, logoURL, openingAndClosingHours } = dto;
        
        const existEmail = await this.restaurantModel.findOne({email})
        if(existEmail){
            throw new HttpException("This email already exist for a restaurant", HttpStatus.ALREADY_REPORTED)
        }

        const restaurantRole = await this.roleModel.findOne({name: RoleEnum.RESTAURANT})
        if(!restaurantRole){
          throw new HttpException("This role does not exist", HttpStatus.NOT_FOUND)
        }

        if(!password){
            throw new HttpException("password is required", HttpStatus.INTERNAL_SERVER_ERROR)
        }
        const hashpassword = await bcrypt.hash(password, 10);

        const user = await this.userModel.create({
            name,
            email,
            password: hashpassword,
           roles: restaurantRole._id,
           isActive: true,
           isVerified: true
        })

        const restaurant = await this.restaurantModel.create({
            name,
            email,
            address,
            description,
            status: RestaurantStatusEnum.PENDING,
            logoURL,
            openingAndClosingHours,
            cuisineTags,
            user: user._id
        })
       
      await restaurant.populate({ path: 'user', populate: { path: 'roles' } });
      await this.mailService.sendRestaurantWelcomeEmail({
        to: email!,
        name: name!,
        email: email!,
        password,
      })
      return restaurant;

    }


    async getAllRestaurants():Promise<Restaurant[]>{
        const restaurant = await this.restaurantModel.find().populate({path:'user'}).populate({path: 'role'})
        return restaurant;
    }

    async getRestaurantById(id: string): Promise<Restaurant>{
        const Restaurant = await this.restaurantModel.findById(id)
        if(!Restaurant){
            throw new HttpException("Restaurant not found", HttpStatus.NOT_FOUND)
        }
        return Restaurant
    }

    async updateRestaurant(id: string, dto: any): Promise<Restaurant> {
      const existRestaurant = await this.restaurantModel.findById(id);
      if (!existRestaurant) {
        throw new HttpException('Restaurant not found', HttpStatus.NOT_FOUND);
      }
     
      const updateData: any = {};
      if (dto.name)    updateData.name = dto.name;
      if (dto.email)   updateData.email = dto.email;
      if (dto.phone)   updateData.phone = dto.phone;
      if (dto.address) updateData.address = dto.address;
      if (dto.logoURL)   updateData.logoURL = dto.logoURL;
      if (dto.description) updateData.description = dto.description;
      if (dto.openingAndClosingHours)   updateData.openingAndClosingHours = dto.openingAndClosingHours;
      if (dto.cuisingTags) updateData.cuisingTags = dto.cuisingTags;
     
      const Restaurant = await this.restaurantModel.findByIdAndUpdate(
        id, updateData, { new: true }
      ).populate({ path: 'user', populate: { path: 'roles' } });
     
      if (!Restaurant) {
        throw new HttpException('Failed to update Restaurant', HttpStatus.INTERNAL_SERVER_ERROR);
      }
     
      const userUpdateData: any = {};
      if (dto.name)  userUpdateData.name = dto.name;
      if (dto.email) userUpdateData.email = dto.email;
     
      if (Object.keys(userUpdateData).length > 0 && existRestaurant.user) {
        await this.userModel.findByIdAndUpdate(existRestaurant.user.toString(), userUpdateData);
      }
     
      return Restaurant;
    }

    async deleteRestaurant(id:string):Promise<void>{
        const existRestaurant = await this.restaurantModel.findById(id)
        if(!existRestaurant){
            throw new HttpException("this restaurant does not exist", HttpStatus.NOT_FOUND)
        }
        const restaurant = await this.restaurantModel.findByIdAndDelete(id)
        if(!restaurant){
                 throw new HttpException('Failed to delete restaurant', HttpStatus.INTERNAL_SERVER_ERROR);             
        }
        const userRestaurant = await this.userModel.findByIdAndDelete(id)
         if(!userRestaurant){
     throw new HttpException('Failed to delete restaurant', HttpStatus.INTERNAL_SERVER_ERROR);             
        }

    }

    async findRestaurantProfile(userId: string):Promise<Restaurant>{
       const restaurant = await this.restaurantModel.findOne({user: new Types.ObjectId(userId)})
       .populate({path: 'user'}).populate({path: 'role'})
       if(!restaurant){
        throw new HttpException("Restaurant profile not found", HttpStatus.NOT_FOUND)
       }
       return restaurant
    }

    async updateRestaurantProfile(id: string, dto: any): Promise<Restaurant> {
      const existRestaurant = await this.restaurantModel
        .findOne({ user: new Types.ObjectId(id) })
        .exec();
    
      if (!existRestaurant) {
        throw new HttpException('Restaurant not found', HttpStatus.NOT_FOUND);
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
      
      const Restaurant = await this.restaurantModel
        .findByIdAndUpdate(existRestaurant._id, updateData, { new: true })
        .populate({ path: 'user', populate: { path: 'roles' } })
        .populate({path: 'Restaurant'})
        .exec();
    
      if (!Restaurant) {
        throw new HttpException('Failed to update Restaurant profile', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    
      return Restaurant.toObject() as Restaurant;
    }

    async updateRestaurantStatus(id: string, status: RestaurantStatusEnum): Promise<Restaurant> {
      const existRestaurant = await this.restaurantModel.findById(id);
      if (!existRestaurant) {
        throw new HttpException('Restaurant not found', HttpStatus.NOT_FOUND);
      }

      const Restaurant = await this.restaurantModel.findByIdAndUpdate(
        id, { status }, { new: true }
      ).populate({ path: 'user', populate: { path: 'roles' } });

      if (!Restaurant) {
        throw new HttpException('Failed to update restaurant status', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return Restaurant;
    }

    



}