import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MenuItem } from "../../menus/schema/menu-item.schema";
import { AiGatewayService } from "../../ai-gateway/service/ai-gateway.service";
import { User } from "../../user/schemas/user.schema";

@Injectable()
export class RecommendationService{
    constructor(
        @InjectModel(MenuItem.name)
        private readonly menuItemModel: Model<MenuItem>,

        private readonly aiGatewayService: AiGatewayService
    ){}

    private async getTrending(topN: number = 5): Promise<any[]>{
        const items = await this.menuItemModel
            .find({isAvailable: true})
            .limit(topN)
            .populate({path: 'restaurant'})

        return items.map(item => ({
            menuItemId: item._id,
            name: item.name,
            photoUrl: item.photoUrl,
            price: item.price,
            restaurant: item.restaurant
        }))
    }

async getHomeFeed(user: User): Promise<{recommendations: any[], coldStart: boolean}>{
        const preferredTags: string[] = []
        const customerId = user._id.toString()

        const aiResult = await this.aiGatewayService.getRecommendations(customerId, preferredTags, 5)

        if(!aiResult || !aiResult.recommendations || aiResult.recommendations.length === 0){
            const trending = await this.getTrending(5)
            return {recommendations: trending, coldStart: true}
        }

        const menuItemIds = aiResult.recommendations.map((r: any) => new Types.ObjectId(r.menuItemId))
        const items = await this.menuItemModel.find({_id: {$in: menuItemIds}}).populate({path: 'restaurant'})

        const enriched = aiResult.recommendations.map((r: any) => {
            const item = items.find(i => i._id.toString() === r.menuItemId)
            return {
                menuItemId: r.menuItemId,
                name: item?.name || r.name,
                photoUrl: item?.photoUrl,
                price: item?.price,
                restaurant: item?.restaurant,
                score: r.score
            }
        })

        return {recommendations: enriched, coldStart: false}
    }

}