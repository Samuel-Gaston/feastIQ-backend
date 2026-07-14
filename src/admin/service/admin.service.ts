import { Injectable, OnApplicationBootstrap, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {User} from '../../user/schemas/user.schema';
import {Role} from '../../roles/schemas/role.schema';
import {Permission} from '../../roles/schemas/permission.schema';
import {UpdateUserDto} from '../../user/dtos/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(Permission.name) private readonly permissionModel: Model<Permission>,
  ) {}

async onApplicationBootstrap() {
  const adminEmail = 'samuelgaston@gmail.com';
  try {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const existingAdmin = await this.userModel.findOne({ email: adminEmail });

    // 1. If admin exists, FORCE update to keep state synchronized
    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      existingAdmin.isVerified = true;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      this.logger.log(`Root admin account [${adminEmail}] synchronized.`);
      return;
    }

    // 2. Otherwise, seed it
    this.logger.warn(`Root admin account [${adminEmail}] missing. Instantiating...`);
    let adminRole = await this.roleModel.findOne({ name: 'ADMIN' });
    if (!adminRole) {
      adminRole = await this.roleModel.create({
        name: 'ADMIN',
        description: 'Root system execution matrix framework',
      });
    }

    const totalPermissions = await this.permissionModel.find({});
    const structuralRootAdmin = await this.userModel.create({
      name: 'Samuel Gaston (Admin)',
      email: adminEmail,
      password: hashedPassword,
      isVerified: true,
      isActive: true,
      roles: adminRole._id,
      permissions: totalPermissions.map((p) => p._id),
    });

    this.logger.log(`Root admin seeded cleanly: ${adminEmail}`);
  } catch (error) {
    this.logger.error('Failed executing admin bootstrap flow:', error);
  }
}



  // Add this method inside your AdminService class matrix
async getAdminProfile(id: string): Promise<User> {
  const admin = await this.userModel
    .findById(id)
    .select('-password') // Bypasses password collection leakage
    .populate({ path: 'roles' })
    .populate({ path: 'permissions' });

  if (!admin) {
    throw new HttpException('Administrative profile reference not found.', HttpStatus.NOT_FOUND);
  }
  return admin;
}


  // Profile update mutation processing
  async updateProfile(id: string, dto: UpdateUserDto): Promise<User> {
    const updateData: Partial<User> = { ...dto } as any;

    // Securely re-hash if updating security credentials
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
}