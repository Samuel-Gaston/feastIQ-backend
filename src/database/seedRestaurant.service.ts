import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { User } from "../user/schemas/user.schema";
import { Role } from "../roles/schemas/role.schema";
import { Restaurant } from "../restaurant/schema/restaurant.schema";
import { MenuItem } from "../menus/schema/menu-item.schema";
import { MenuItemCategoryEnum } from "../common/enums/menu-item-category.enum";
import { RestaurantStatusEnum } from "../common/enums/restaurant.status";
import { RoleEnum } from "../common/enums/role.enum";


const restaurantNames = [
    {name: "Chez Maman Douala", cuisineTags: ["Local", "Grill"]},
    {name: "Le Petit Paris", cuisineTags: ["Continental", "French"]},
    {name: "Akwa Street Kitchen", cuisineTags: ["Local", "Street Food"]},
    {name: "Sushi Bar Bonanjo", cuisineTags: ["Japanese", "Sushi"]},
    {name: "Golden Wok", cuisineTags: ["Chinese", "Asian"]},
    {name: "Mami Ngo's Kitchen", cuisineTags: ["Local", "Traditional"]},
    {name: "PizzaVille Bonapriso", cuisineTags: ["Italian", "Pizza"]},
    {name: "Ocean Grill Deido", cuisineTags: ["Seafood", "Grill"]},
    {name: "Fresh Fruit Corner", cuisineTags: ["Fruits", "Healthy"]},
    {name: "Burger House Makepe", cuisineTags: ["Fast Food", "Burgers"]},
]

const menuTemplates = [
    {name: "Jollof Rice", category: MenuItemCategoryEnum.LUNCH, price: 2000, tags: ["local", "spicy"]},
    {name: "Grilled Chicken", category: MenuItemCategoryEnum.DINNER, price: 3500, tags: ["grill", "protein"]},
    {name: "Ndole with Plantain", category: MenuItemCategoryEnum.LUNCH, price: 2500, tags: ["local", "traditional"]},
    {name: "Croissant", category: MenuItemCategoryEnum.BREAKFAST, price: 500, tags: ["pastry", "french"]},
    {name: "Omelette", category: MenuItemCategoryEnum.BREAKFAST, price: 1000, tags: ["egg", "quick"]},
    {name: "Sushi Roll Combo", category: MenuItemCategoryEnum.DINNER, price: 4500, tags: ["japanese", "fish"]},
    {name: "Fried Rice", category: MenuItemCategoryEnum.LUNCH, price: 2200, tags: ["asian", "rice"]},
    {name: "Spring Rolls", category: MenuItemCategoryEnum.LUNCH, price: 1500, tags: ["asian", "appetizer"]},
    {name: "Margherita Pizza", category: MenuItemCategoryEnum.DINNER, price: 3000, tags: ["italian", "cheese"]},
    {name: "Pepperoni Pizza", category: MenuItemCategoryEnum.DINNER, price: 3500, tags: ["italian", "spicy"]},
    {name: "Grilled Fish", category: MenuItemCategoryEnum.DINNER, price: 4000, tags: ["seafood", "grill"]},
    {name: "Prawns Platter", category: MenuItemCategoryEnum.DINNER, price: 5000, tags: ["seafood", "premium"]},
    {name: "Fresh Mango Bowl", category: MenuItemCategoryEnum.FRUITS, price: 800, tags: ["fruit", "healthy"]},
    {name: "Pineapple Slices", category: MenuItemCategoryEnum.FRUITS, price: 600, tags: ["fruit", "healthy"]},
    {name: "Watermelon Bowl", category: MenuItemCategoryEnum.FRUITS, price: 700, tags: ["fruit", "healthy"]},
    {name: "Classic Cheeseburger", category: MenuItemCategoryEnum.LUNCH, price: 2800, tags: ["fast food", "beef"]},
    {name: "Chicken Burger", category: MenuItemCategoryEnum.LUNCH, price: 2600, tags: ["fast food", "chicken"]},
    {name: "French Fries", category: MenuItemCategoryEnum.LUNCH, price: 1000, tags: ["side", "fast food"]},
    {name: "Mango Juice", category: MenuItemCategoryEnum.DRINKS, price: 500, tags: ["juice", "fruit"]},
    {name: "Ginger Drink", category: MenuItemCategoryEnum.DRINKS, price: 400, tags: ["local", "drink"]},
    {name: "Bottled Water", category: MenuItemCategoryEnum.DRINKS, price: 300, tags: ["water"]},
    {name: "Soft Drink", category: MenuItemCategoryEnum.DRINKS, price: 500, tags: ["soda"]},
]

@Injectable()
export class SeedService implements OnApplicationBootstrap{
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>,

        @InjectModel(Restaurant.name)
        private readonly restaurantModel: Model<Restaurant>,

        @InjectModel(MenuItem.name)
        private readonly menuItemModel: Model<MenuItem>,
    ){}

    async onApplicationBootstrap(){
        const existingCount = await this.restaurantModel.countDocuments()
        if(existingCount > 0){
            console.log(`Seed skipped — ${existingCount} restaurants already exist`)
            return
        }

        const restaurantRole = await this.roleModel.findOne({name: RoleEnum.RESTAURANT})
        if(!restaurantRole){
            console.log("Seed skipped — RESTAURANT role not found yet")
            return
        }

        console.log("No restaurants found — seeding initial data...")

        let totalMenuItems = 0

        for(const [index, restaurantInfo] of restaurantNames.entries()){
            const email = `owner${index + 1}@feastiq-seed.com`
            const hashedPassword = await bcrypt.hash("Password123!", 10)

            const user = await this.userModel.create({
                name: `Owner of ${restaurantInfo.name}`,
                email,
                password: hashedPassword,
                roles: restaurantRole._id,
                isActive: true,
                isVerified: true
            })

            const restaurant = await this.restaurantModel.create({
                name: restaurantInfo.name,
                email,
                password: hashedPassword,
                description: `Great food from ${restaurantInfo.name}`,
                cuisineTags: restaurantInfo.cuisineTags,
                address: "Douala, Cameroon",
                openingAndClosingHours: "8:00 AM - 10:00 PM",
                status: RestaurantStatusEnum.APPROVED,
                user: user._id
            })

            const itemsPerRestaurant = 10
            const shuffled = [...menuTemplates].sort(() => Math.random() - 0.5)
            const selectedItems = shuffled.slice(0, itemsPerRestaurant)

            for(const item of selectedItems){
                await this.menuItemModel.create({
                    name: item.name,
                    description: `Delicious ${item.name} made fresh daily`,
                    category: item.category,
                    price: item.price,
                    photoUrl: "",
                    tags: item.tags,
                    isAvailable: true,
                    prepTimeMinutes: 15 + Math.floor(Math.random() * 20),
                    restaurant: restaurant._id
                })
                totalMenuItems++
            }

            console.log(`Seeded restaurant: ${restaurantInfo.name} with ${itemsPerRestaurant} dishes`)
        }

        console.log(`Seeding complete. ${restaurantNames.length} restaurants, ${totalMenuItems} menu items.`)
    }

}