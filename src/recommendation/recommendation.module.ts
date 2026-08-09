import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MenuItem, MenuItemSchema } from "../menus/schema/menu-item.schema";
import { RecommendationService } from "./service/recommendation.service";
import { RecommendationController } from "./controller/recommendation.controller";
import { AiGatewayModule } from "../ai-gateway/ai-gateway.module";


@Module({
    imports:[
       MongooseModule.forFeature([
        {name: MenuItem.name, schema:MenuItemSchema},
       ]),
       AiGatewayModule
    ],
    providers:[RecommendationService],
    controllers:[RecommendationController],
})
export class RecommendationModule{}