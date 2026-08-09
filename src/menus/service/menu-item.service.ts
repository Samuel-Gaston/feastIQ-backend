import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MenuItem } from "../schema/menu-item.schema";
import { Model } from "mongoose";
import { Restaurant } from "../../restaurant/schema/restaurant.schema";
import { CreateMenuItemDTO } from "../dto/create-menu-item.dto";
import { BulkCreateMenuItemsDTO } from "../dto/bulk-create-menu-items.dto";
import { HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { RoleEnum } from "../../common/enums/role.enum";
import { RestaurantStatusEnum } from "../../common/enums/restaurant.status";
import { AiGatewayService } from "../../ai-gateway/service/ai-gateway.service";

@Injectable()
export class MenuItemService{
  constructor(
        @InjectModel(MenuItem.name)
        private readonly menuItemModel: Model<MenuItem>,

        @InjectModel(Restaurant.name)
        private readonly restaurantModel: Model<Restaurant>,

        private readonly aiGatewayService: AiGatewayService
    ){}


    private async resolveRestaurantForUser(user: User, dtoRestaurantId?: string): Promise<string>{
        let restaurant: Restaurant | null;

        if(user.roles?.name === RoleEnum.ADMIN){
            if(!dtoRestaurantId){
                throw new HttpException("restaurant id is required for admin", HttpStatus.BAD_REQUEST)
            }
            restaurant = await this.restaurantModel.findById(dtoRestaurantId)
            if(!restaurant){
                throw new HttpException("This restaurant does not exist", HttpStatus.NOT_FOUND)
            }
        } else {
            restaurant = await this.restaurantModel.findOne({user: new Types.ObjectId(user._id.toString())})
            if(!restaurant){
                throw new HttpException("Restaurant profile not found for this user", HttpStatus.NOT_FOUND)
            }
        }

        if(restaurant.status !== RestaurantStatusEnum.APPROVED){
            throw new HttpException("Your restaurant must be approved by an admin before you can manage its menu", HttpStatus.FORBIDDEN)
        }

        return restaurant._id.toString()
    }

  async create(dto: CreateMenuItemDTO, user: User): Promise<MenuItem>{
        const {name, description, category, price, photoUrl, tags, isAvailable, prepTimeMinutes, restaurant} = dto;

        const restaurantId = await this.resolveRestaurantForUser(user, restaurant)

        const menuItem = await this.menuItemModel.create({
            name,
            description,
            category,
            price,
            photoUrl,
            tags,
            isAvailable,
            prepTimeMinutes,
            restaurant: new Types.ObjectId(restaurantId)
        })

        if(photoUrl){
            const aiResult = await this.aiGatewayService.classifyFoodByUrl(photoUrl)
            if(aiResult && aiResult.predictedCategory){
                menuItem.aiTag = {
                    predictedCategory: aiResult.predictedCategory,
                    confidence: aiResult.confidence
                }
                await menuItem.save()
            }
        }

        await menuItem.populate({path: 'restaurant'})
        return menuItem;
    }

    async bulkCreate(dto: BulkCreateMenuItemsDTO, user: User): Promise<MenuItem[]>{
        if(!dto.items || dto.items.length === 0){
            throw new HttpException("items array is required", HttpStatus.BAD_REQUEST)
        }

        const restaurantId = await this.resolveRestaurantForUser(user, dto.restaurant)

        const docs = dto.items.map(item => ({
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            photoUrl: item.photoUrl,
            tags: item.tags,
            isAvailable: item.isAvailable,
            prepTimeMinutes: item.prepTimeMinutes,
            restaurant: new Types.ObjectId(restaurantId)
        }))

        const menuItems = await this.menuItemModel.insertMany(docs)
        return menuItems as unknown as MenuItem[];
    }

    async getAllMenuItems(restaurantId?: string):Promise<MenuItem[]>{
        const filter: any = {}
        if(restaurantId){
            filter.restaurant = new Types.ObjectId(restaurantId)
        }
        const menuItems = await this.menuItemModel.find(filter).populate({path:'restaurant'})
        return menuItems;
    }

    async searchMenuItems(query: string): Promise<MenuItem[]>{
        if(!query){
            throw new HttpException("search query 'q' is required", HttpStatus.BAD_REQUEST)
        }
        const menuItems = await this.menuItemModel.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } },
            ]
        }).populate({path:'restaurant'})
        return menuItems;
    }

    async getMenuItemsByRestaurant(restaurantId: string):Promise<MenuItem[]>{
        const existRestaurant = await this.restaurantModel.findById(restaurantId)
        if(!existRestaurant){
            throw new HttpException("This restaurant does not exist", HttpStatus.NOT_FOUND)
        }
        const menuItems = await this.menuItemModel.find({restaurant: new Types.ObjectId(restaurantId)}).populate({path:'restaurant'})
        return menuItems;
    }

    async getMyMenuItems(user: User):Promise<MenuItem[]>{
        const restaurant = await this.restaurantModel.findOne({user: new Types.ObjectId(user._id.toString())})
        if(!restaurant){
            throw new HttpException("Restaurant profile not found for this user", HttpStatus.NOT_FOUND)
        }
        const menuItems = await this.menuItemModel.find({restaurant: restaurant._id}).populate({path:'restaurant'})
        return menuItems;
    }

    async getMenuItemById(id: string): Promise<MenuItem>{
        const menuItem = await this.menuItemModel.findById(id).populate({path:'restaurant'})
        if(!menuItem){
            throw new HttpException("Menu item not found", HttpStatus.NOT_FOUND)
        }
        return menuItem
    }

    async updateMenuItem(id: string, dto: any): Promise<MenuItem> {
      const existMenuItem = await this.menuItemModel.findById(id);
      if (!existMenuItem) {
        throw new HttpException('Menu item not found', HttpStatus.NOT_FOUND);
      }

      const updateData: any = {};
      if (dto.name)              updateData.name = dto.name;
      if (dto.description)       updateData.description = dto.description;
      if (dto.category)          updateData.category = dto.category;
      if (dto.price !== undefined) updateData.price = dto.price;
      if (dto.photoUrl)          updateData.photoUrl = dto.photoUrl;
      if (dto.tags)               updateData.tags = dto.tags;
      if (dto.isAvailable !== undefined) updateData.isAvailable = dto.isAvailable;
      if (dto.prepTimeMinutes !== undefined) updateData.prepTimeMinutes = dto.prepTimeMinutes;

      const menuItem = await this.menuItemModel.findByIdAndUpdate(
        id, updateData, { new: true }
      ).populate({path:'restaurant'});

      if (!menuItem) {
        throw new HttpException('Failed to update menu item', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return menuItem;
    }

    async deleteMenuItem(id:string):Promise<void>{
        const existMenuItem = await this.menuItemModel.findById(id)
        if(!existMenuItem){
            throw new HttpException("This menu item does not exist", HttpStatus.NOT_FOUND)
        }
        const menuItem = await this.menuItemModel.findByIdAndDelete(id)
        if(!menuItem){
            throw new HttpException('Failed to delete menu item', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}