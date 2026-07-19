import {
  Body, Controller, Delete, Get, Param, Post,
  UseGuards, Req,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AdminMessageService } from "../service/adminMessage.service";
import { SendMessageDTO, AdminReplyDTO } from "../dto/create-adminMesssage.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";

@ApiTags('Admin Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
@ApiResponse({ status: 403, description: 'FORBIDDEN' })
@ApiResponse({ status: 404, description: 'NOT FOUND' })
@ApiResponse({ status: 500, description: 'SERVER_ERROR' })
@Controller('admin-messages')
export class AdminMessageController {
  constructor(private readonly adminMessageService: AdminMessageService) {}

  // ─── PATIENT: Send a message to admin ───────────────────────────────
  @Post()
  @Roles(RoleEnum.PATIENT)
  @ApiOperation({ summary: 'Patient sends a message to admin' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async send(@Req() req: any, @Body() dto: SendMessageDTO) {
    const response = await this.adminMessageService.sendMessage(req.user._id, dto);
    return { data: response, message: 'Message sent successfully' };
  }

  // ─── PATIENT: Get own thread with admin ─────────────────────────────
  @Get('my/thread')
  @Roles(RoleEnum.PATIENT)
  @ApiOperation({ summary: 'Patient gets their own conversation thread with admin' })
  async getMyThread(@Req() req: any) {
    const response = await this.adminMessageService.getMyThread(req.user._id);
    return { data: response, message: 'Thread fetched successfully' };
  }

  // ─── ADMIN: Get stats ────────────────────────────────────────────────
  @Get('stats')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get message stats for admin dashboard cards' })
  async getStats() {
    const response = await this.adminMessageService.getStats();
    return { data: response, message: 'Stats fetched successfully' };
  }

  // ─── ADMIN: Get all patient threads ─────────────────────────────────
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin gets all patient message threads' })
  async getAllThreads() {
    const response = await this.adminMessageService.getAllThreads();
    return { data: response, message: 'Threads fetched successfully' };
  }

  // ─── ADMIN: Get single thread ────────────────────────────────────────
  // NOTE: must come after /stats and /my/thread to avoid :id conflict
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin opens a specific patient thread' })
  async getThread(@Param('id') id: string) {
    const response = await this.adminMessageService.getThread(id);
    return { data: response, message: 'Thread fetched successfully' };
  }

  // ─── ADMIN: Reply to a thread ────────────────────────────────────────
  @Post(':id/reply')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin replies to a patient thread' })
  async reply(
    @Param('id') id: string,
    @Body() dto: AdminReplyDTO,
    @Req() req: any,
  ) {
    const response = await this.adminMessageService.adminReply(id, dto, req.user);
    return { data: response, message: 'Reply sent successfully' };
  }

  // ─── ADMIN: Delete thread ────────────────────────────────────────────
  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin deletes a patient thread' })
  async delete(@Param('id') id: string) {
    const response = await this.adminMessageService.deleteThread(id);
    return { data: response, message: 'Thread deleted successfully' };
  }
}