import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiChatService } from '../service/ai-chat.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('message')
  async send(@Req() req: any, @Body('content') content: string) {
    return this.aiChatService.sendMessage(req.user._id, content);
  }

  @Get('history')
  async history(@Req() req: any) {
    return this.aiChatService.getHistory(req.user._id);
  }
}