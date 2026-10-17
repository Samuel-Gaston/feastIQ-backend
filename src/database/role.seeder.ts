import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../roles/schemas/role.schema';
import { RoleEnum } from '../common/enums/role.enum';

const DEFAULT_ROLES = [
  { name: RoleEnum.ADMIN, description: 'This is ADMIN role' },
  { name: RoleEnum.SUPER_ADMIN, description: 'This is SUPER_ADMIN role' },
  { name: RoleEnum.CUSTOMER, description: 'This is CUSTOMER role' },
  { name: RoleEnum.RESTAURANT, description: 'This is the restaurant role' },
];

@Injectable()
export class RoleSeeder implements OnModuleInit {
  private readonly logger = new Logger(RoleSeeder.name);

  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>) {}

  async onModuleInit() {
    for (const role of DEFAULT_ROLES) {
      const result = await this.roleModel.updateOne(
        { name: role.name },
        {
          $setOnInsert: {
            ...role,
            isSystem: false,
            isActive: true,
            users: [],
            permissions: [],
          },
        },
        { upsert: true },
      );
      if (result.upsertedCount > 0) this.logger.log(`Seeded role: ${role.name}`);
    }
  }
}