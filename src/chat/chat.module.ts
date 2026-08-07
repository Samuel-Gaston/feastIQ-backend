import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpModule } from "@nestjs/axios";
import { Chat, ChatSchema } from "./schema/chat.schema";
import { ChatService } from "./service/chat.service";
import { ChatController } from "./controller/chat.controller";
import { OrderModule } from "../order/order.module";


@Module({
    imports:[
       MongooseModule.forFeature([
        {name: Chat.name, schema:ChatSchema},
       ]),
       HttpModule,
       OrderModule
    ],
    providers:[ChatService],
    controllers:[ChatController],
    exports:[ChatService]
})
export class ChatModule{}