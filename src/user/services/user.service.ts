import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Permission } from "../../roles/schemas/permission.schema";
import { Role } from "../../roles/schemas/role.schema";
import { User } from "../schemas/user.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateUserDto } from "../dtos/create-user.dto";
import * as bcrypt from 'bcryptjs'
import { MailService } from "../../common/mail/mail.service";


@Injectable()
export class UserService{
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,

    private readonly mailService: MailService,
  ){}

async createUser(dto: CreateUserDto) {
  const { name,email, password,isVerified, isActive, roleId, permissionIds, doctor, patient } = dto;

  const existingUser = await this.userModel.findOne({ email });
  if (existingUser) {
    throw new HttpException("User with this email already exists", HttpStatus.BAD_REQUEST, );
  }

  const existRole = await this.roleModel.findById(roleId);
  if (!existRole) {
    throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
  }

  let permissions: Permission[] = [];
  if (permissionIds && permissionIds.length) {

    permissions = await this.permissionModel.find({
      _id: { $in: permissionIds },
    });

    const foundIds = permissions.map((p) => p._id.toString());
    const missing = permissionIds.filter((id) => !foundIds.includes(id));

    if (missing.length) {
      throw new HttpException(
        `Permissions not found: ${missing.join(', ')}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  if (!password) {
    throw new HttpException('Password is required', HttpStatus.BAD_REQUEST, );
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new this.userModel({
    name: doctor?.name || patient?.name || name,
    email,
    password: hashedPassword,
    isVerified: isVerified ?? false,
    isActive: isActive ?? true,
    roles: existRole,
    permissions: permissions,
  });

  const savedUser = await user.save();

  // Send email with credentials
  if (savedUser.email && savedUser.name) {
    try {
      await this.mailService.sendUserCredentials(
        savedUser.email,
        password, // send plain password, not hashed
        savedUser.name,
      );
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  return savedUser;
}
}