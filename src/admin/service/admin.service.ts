import { Injectable, OnApplicationBootstrap, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {User} from '../../user/schemas/user.schema';
import {Role} from '../../roles/schemas/role.schema';
import {Permission} from '../../roles/schemas/permission.schema';
import {UpdateUserDto} from '../../user/dtos/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { AuditLogService } from '../../audit-log/service/audit-log.service';
import { ConfigService } from '@nestjs/config';
import { AuditLog } from '../../audit-log/schema/audit-log.schema';
import { RoleEnum } from '../../common/enums/role.enum';

@Injectable()
export class AdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminService.name);

constructor(
  @InjectModel(User.name) private readonly userModel: Model<User>,
  @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  @InjectModel(Permission.name) private readonly permissionModel: Model<Permission>,
  @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>,
  private readonly auditLogService: AuditLogService,
  private readonly configService: ConfigService,
 
) {}
async onApplicationBootstrap() {
  const adminEmail = this.configService.get<string>('SEED_ADMIN_EMAIL')?.trim().toLowerCase();
  const adminPassword = this.configService.get<string>('SEED_ADMIN_PASSWORD');
  const adminName = this.configService.get<string>('SEED_ADMIN_NAME') || 'FeastIQ Admin';

  if (!adminEmail || !adminPassword) {
    this.logger.warn('SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set. Skipping admin seed.');
    return;
  }

  try {
    // The ADMIN role is created by RoleSeeder, which always runs before this method.
    const adminRole = await this.roleModel.findOne({ name: RoleEnum.ADMIN });
    if (!adminRole) {
      this.logger.error('ADMIN role not found. Admin seed aborted.');
      return;
    }

    const permissionIds = (await this.permissionModel.find({}, '_id').lean()).map((p) => p._id);
    const existingAdmin = await this.userModel.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Repair role and flags, but never overwrite a password changed later.
      existingAdmin.roles = adminRole._id as any;
      existingAdmin.isVerified = true;
      existingAdmin.isActive = true;
      if (permissionIds.length) existingAdmin.permissions = permissionIds as any;
      await existingAdmin.save();
      this.logger.log(`Admin [${adminEmail}] verified and synced with ADMIN role.`);
      return;
    }

    await this.userModel.create({
      name: adminName,
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      isVerified: true,
      isActive: true,
      roles: adminRole._id,
      permissions: permissionIds,
    });
    this.logger.log(`Admin created: ${adminEmail}`);
  } catch (error) {
    this.logger.error(`Admin seed failed: ${(error as Error).message}`, (error as Error).stack);
  }
}

async getAdminProfile(id: string): Promise<User> {
const admin = await this.userModel
    .findById(id)
    .select('-password') 
    .populate({ path: 'roles' })
    .populate({ path: 'permissions' });

if (!admin) {
throw new HttpException('Administrative profile reference not found.', HttpStatus.NOT_FOUND);
  }
return admin;
}

async updateProfile(id: string, dto: UpdateUserDto): Promise<User> {
const updateData: Partial<User> = { ...dto } as any;

if (dto.password) {
updateData.password = await bcrypt.hash(dto.password, 10);
    }

const updatedAdmin = await this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate({ path: 'roles' })
      .populate({ path: 'permissions' });

if (!updatedAdmin) {
throw new HttpException('Administrative record not found or update rejected', HttpStatus.BAD_REQUEST);
    }

return updatedAdmin;
  }

 
private growth(total: number, newThisMonth: number): number {
  const before = total - newThisMonth;
  if (before <= 0) return newThisMonth > 0 ? 100 : 0;
  return Math.round((newThisMonth / before) * 100);
}

private async totalAndGrowth(model: Model<any>, filter: any, monthStart: Date) {
  const [total, newThisMonth] = await Promise.all([
    model.countDocuments(filter),
    model.countDocuments({ ...filter, createdAt: { $gte: monthStart } }),
  ]);
  return { total, growthPercent: this.growth(total, newThisMonth) };
}



  

  async createUser(actorId: string, dto: { name: string; email: string; password: string; roleId: string }): Promise<User> {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new HttpException('A user with this email already exists', HttpStatus.CONFLICT);
    }

    const role = await this.roleModel.findById(dto.roleId);
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      isVerified: true,
      isActive: true,
      roles: role._id,
    });


    return user;
  }

  async setUserStatus(actorId: string, targetId: string, isActive: boolean): Promise<User> {
    if (actorId === targetId) {
      throw new HttpException('You cannot perform this action on your own account', HttpStatus.FORBIDDEN);
    }

    const user = await this.userModel.findByIdAndUpdate(targetId, { isActive }, { new: true }).select('-password');
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }


    return user;
  }

  async deleteUser(actorId: string, targetId: string): Promise<void> {
    if (actorId === targetId) {
      throw new HttpException('You cannot perform this action on your own account', HttpStatus.FORBIDDEN);
    }

    const user = await this.userModel.findByIdAndDelete(targetId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

  
  }
}