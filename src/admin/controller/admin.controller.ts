import { Controller, Body, Patch, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'; // 👈 Add UseGuards
import { AdminService } from '../service/admin.service';
import { UpdateUserDto } from '../../user/dtos/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../user/schemas/user.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard) 
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Fetch current logged-in Admin profile metrics
   * GET /admin/me
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@CurrentUser() user: User) {
    // Now 'user' will be populated cleanly instead of being null!
    return this.adminService.getAdminProfile(user._id.toString());
  }

  /**
   * Update current logged-in Admin profile
   * PATCH /admin/profile
   */
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateAdminProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminService.updateProfile(user._id.toString(), dto);
  }
}