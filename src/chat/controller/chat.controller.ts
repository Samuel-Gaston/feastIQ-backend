import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ChatService } from "../service/chat.service";
import { SendMessageDTO } from "../dto/send-message.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Chat Assistant')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('chat')
export class ChatController{
    constructor(
        private readonly chatService: ChatService
    ){}

    @Post('message')
    @Roles(RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'send a message to the support assistant'})
    @ApiResponse({status: 200, description:'reply generated successfully'})
    async sendMessage(
        @Body() dto: SendMessageDTO,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.chatService.sendMessage(dto, user)
        const message = i18n.t("common.CHAT_REPLY_GENERATED")
        return {data:response, message}
    }

    @Get('history')
    @Roles(RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'get chat history with the assistant'})
    @ApiResponse({status: 200, description:'chat history fetched successfully'})
    async getHistory(
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.chatService.getMyHistory(user)
        const message = i18n.t("common.CHAT_HISTORY_READ")
        return {data:response, message}
    }

}