import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cart } from "../schema/cart.schema";
import { Model, Types } from "mongoose";
import { MenuItem } from "../../menus/schema/menu-item.schema";
import { AddCartItemDTO } from "../dtos/add-cart-item.dto";
import { UpdateCartItemDTO } from "../dtos/update-cart-item.dto";
import { HttpStatus } from "@nestjs/common";
import { User } from "../../user/schemas/user.schema";


@Injectable()
export class CartService{
    constructor(
        @InjectModel(Cart.name)
        private readonly cartModel: Model<Cart>,

        @InjectModel(MenuItem.name)
        private readonly menuItemModel: Model<MenuItem>,
    ){}


    private async getOrCreateCart(user: User): Promise<Cart>{
        let cart = await this.cartModel.findOne({customer: new Types.ObjectId(user._id.toString())})
        if(!cart){
            cart = await this.cartModel.create({
                customer: new Types.ObjectId(user._id.toString()),
                items: []
            })
        }
        return cart
    }

    async getMyCart(user: User): Promise<Cart>{
        const cart = await this.getOrCreateCart(user)
        await cart.populate({path: 'restaurant'})
        return cart
    }

    async addItem(dto: AddCartItemDTO, user: User): Promise<Cart>{
        if(!dto.menuItemId){
            throw new HttpException("menuItemId is required", HttpStatus.BAD_REQUEST)
        }

        const menuItem = await this.menuItemModel.findById(dto.menuItemId)
        if(!menuItem){
            throw new HttpException("Menu item not found", HttpStatus.NOT_FOUND)
        }
        if(!menuItem.isAvailable){
            throw new HttpException("This dish is currently unavailable", HttpStatus.BAD_REQUEST)
        }

        const cart = await this.getOrCreateCart(user)
        const quantity = dto.quantity && dto.quantity > 0 ? dto.quantity : 1

        if(cart.items && cart.items.length > 0 && cart.restaurant?.toString() !== menuItem.restaurant?.toString()){
            cart.items = []
        }

        cart.restaurant = menuItem.restaurant

        const existingItem = cart.items?.find(item => item.menuItem?.toString() === dto.menuItemId)
        if(existingItem){
            existingItem.quantity = (existingItem.quantity ?? 0) + quantity
        } else {
            cart.items?.push({
                menuItem: new Types.ObjectId(dto.menuItemId),
                name: menuItem.name,
                unitPrice: menuItem.price,
                quantity
            })
        }

        await cart.save()
        await cart.populate({path: 'restaurant'})
        return cart
    }

    async updateItem(menuItemId: string, dto: UpdateCartItemDTO, user: User): Promise<Cart>{
        if(!dto.quantity || dto.quantity < 1){
            throw new HttpException("quantity must be at least 1", HttpStatus.BAD_REQUEST)
        }

        const cart = await this.getOrCreateCart(user)
        const item = cart.items?.find(item => item.menuItem?.toString() === menuItemId)
        if(!item){
            throw new HttpException("This item is not in your cart", HttpStatus.NOT_FOUND)
        }

        item.quantity = dto.quantity
        await cart.save()
        await cart.populate({path: 'restaurant'})
        return cart
    }

    async removeItem(menuItemId: string, user: User): Promise<Cart>{
        const cart = await this.getOrCreateCart(user)
        const existingLength = cart.items?.length ?? 0
        cart.items = cart.items?.filter(item => item.menuItem?.toString() !== menuItemId)

        if(cart.items?.length === existingLength){
            throw new HttpException("This item is not in your cart", HttpStatus.NOT_FOUND)
        }

        if(cart.items?.length === 0){
            cart.restaurant = undefined
        }

        await cart.save()
        await cart.populate({path: 'restaurant'})
        return cart
    }

    async clearCart(user: User): Promise<void>{
        const cart = await this.getOrCreateCart(user)
        cart.items = []
        cart.restaurant = undefined
        await cart.save()
    }

}