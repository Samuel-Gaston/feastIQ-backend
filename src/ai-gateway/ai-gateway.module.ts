import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AiGatewayService } from "./service/ai-gateway.service";

@Module({
    imports:[HttpModule],
    providers:[AiGatewayService],
    exports:[AiGatewayService]
})
export class AiGatewayModule{}