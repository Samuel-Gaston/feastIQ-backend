import { Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../user/schemas/user.schema";
import { Role } from "../roles/schemas/role.schema";
import { Permission } from "../roles/schemas/permission.schema";
import { RoleEnum } from "../common/enums/role.enum";
import * as bcrypt from "bcryptjs";

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(Permission.name) private readonly permissionModel: Model<Permission>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log("Executing startup database initialization seed check...");
    try {
      await this.seedAdminUser();
    } catch (error) {
      this.logger.error("Database seeding iteration sequence failed:", error);
    }
  }

  private async seedAdminUser() {
    const adminEmail = "samuelgaston@gmail.com";

    // 1. Verify if the target root credential already exists
    const existingAdmin = await this.userModel.findOne({ email: adminEmail });
    if (existingAdmin) {
      this.logger.log(`Root account [${adminEmail}] verified. Seeding bypassed.`);
      return;
    }

    this.logger.warn(`Root account [${adminEmail}] missing. Spawning structural identity...`);

    // 2. Locate or provision the baseline ADMIN reference role node
    let adminRole = await this.roleModel.findOne({ name: RoleEnum.ADMIN });
    if (!adminRole) {
      this.logger.log(`Provisioning baseline Role schema node for [${RoleEnum.ADMIN}]...`);
      adminRole = new this.roleModel({
        name: RoleEnum.ADMIN,
        description: "Root Administration access credential framework",
      });
      await adminRole.save();
    }

    // 3. Fetch default permission nodes to bind to the root matrix
    const totalPermissions = await this.permissionModel.find({});

    // 4. Hash the password key matching the UserService parameter (10 rounds)
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // 5. Commit instance document to collection space
    const structuralRootAdmin = new this.userModel({
      name: "Samuel Gaston (Root Admin)",
      email: adminEmail,
      password: hashedPassword,
      isVerified: true,
      isActive: true,
      roles: adminRole._id,
      permissions: totalPermissions.map((p) => p._id),
    });

    await structuralRootAdmin.save();
    this.logger.log(`🎉 Root account initialized successfully: ${adminEmail} / Admin@123`);
  }
}