import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ConflictException, HttpException, HttpStatus,} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../../user/schemas/user.schema';
import { Customer } from '../../customer/schemas/customer.schema';
import { Role } from '../../roles/schemas/role.schema';
import { RoleEnum } from '../../common/enums/role.enum';
import { MailService } from '../../common/mail/mail.service';
import { CreateCustomerDTO } from '../../customer/dtos/create-customer.dto';
import { LoginDto } from '../dtos/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../dtos/reset-password.dto';
import { Logger } from '@nestjs/common';
import { JwtSignOptions } from '@nestjs/jwt';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

private generateAccessToken(user: User & { _id: Types.ObjectId }, roleName: string): string {
  const payload = {
    sub: user._id.toString(),
    email: user.email ?? '',
    role: roleName,
  };
  return this.jwtService.sign(payload, {
    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    expiresIn: '15m',
  });
}

private hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

private async resolveRoleName(user: any): Promise<string> {
  let roleName: string | undefined = user.roles?.name;
  if (!roleName) {
    const roleId = user.roles?._id ?? user.roles;
    const role = roleId ? await this.roleModel.findById(roleId).lean() : null;
    roleName = (role as any)?.name;
  }
  if (!roleName) {
    throw new UnauthorizedException('No role is assigned to this account');
  }
  return roleName;
}




private generateRefreshToken(user: User & { _id: Types.ObjectId }): string {
  const payload = {
    sub: user._id.toString(),
    email: user.email ?? '',
  };
  
  const secret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
 
  const expiresIn = (this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d') as any;

  const signOptions: JwtSignOptions = {
    secret,
    expiresIn,
  };

  return this.jwtService.sign(payload, signOptions);
}


private generateResetToken(userId: string, email: string): string {
  const payload = { sub: userId, email };

  const secret =
    (this.configService.get<string>('JWT_RESET_PASSWORD') as string) ||
    (this.configService.get<string>('JWT_ACCESS_SECRET') as string);
    
  const expiresIn = (this.configService.get<string>('EXPIRES_RESET_PASSWORD') || '1h');
  return this.jwtService.sign(payload, { 
    secret, 
    expiresIn 
  } as any);
}


  async register(dto: CreateCustomerDTO) {
    const { name, email, address, phone, password } = dto;

    const existingEmail = await this.customerModel.findOne({ email });
    if (existingEmail) {
      throw new ConflictException('customer with this email already exists');
    }

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const customerRole = await this.roleModel.findOne({ name: RoleEnum.CUSTOMER });
    if (!customerRole) {
      throw new NotFoundException('customer role not found');
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS')) || 10,
    );

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true,
      isActive: true, 
      roles: customerRole._id,
    });

    const customer = await this.customerModel.create({
      name,
      email,
      address,
      phone,
      role: customerRole._id,
      user: user._id,
    });

    await customer.populate({ path: 'user', populate: { path: 'roles' } });

    await this.mailService.sendCustomerWelcomeEmail({
      to: email!,
      name: name!,
      email: email!,
      password,
    });

    return {
      message: 'Registration successful. You can now log in.',
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
    };
  }

 
async login(dto: LoginDto) {
  const { email, password } = dto;

  const user = await this.userModel.findOne({ email }).populate('roles');
  
  if (!user) {
    this.logger.warn(`Login failed: No user found for ${email}`);
    throw new UnauthorizedException('Invalid email or password');
  }

  if (!user.isActive) {
    this.logger.warn(`Login failed: Account inactive ${email}`);
    throw new UnauthorizedException('Your account has been deactivated');
  }

  if (!user.isVerified) {
    this.logger.warn(`Login failed: Account not verified ${email}`);
    throw new UnauthorizedException('Please verify your account first');
  }

  const isPasswordValid = await bcrypt.compare(password!, user.password!);
  if (!isPasswordValid) {
    this.logger.warn(`Login failed: Password mismatch for ${email}`);
    throw new UnauthorizedException('Invalid email or password');
  }

 const roleName = await this.resolveRoleName(user);
  const accessToken = this.generateAccessToken(user as any, roleName);
  const refreshToken = this.generateRefreshToken(user as any);
  
const refreshTokenHash = this.hashToken(refreshToken);
  await this.userModel.findByIdAndUpdate(user._id, { refreshTokenHash });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: roleName,
      isVerified: user.isVerified,
      isActive: user.isActive,
    },
  };
}

 
async refreshToken(token: string) {
  if (!token) {
    throw new BadRequestException('Refresh token is required');
  }

  let payload: any;
  try {
    payload = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  } catch (e) {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  const user = await this.userModel.findById(payload.sub).populate('roles');
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  if (!user.refreshTokenHash || this.hashToken(token) !== user.refreshTokenHash) {
    throw new UnauthorizedException('Session has been revoked. Please log in again.');
  }

  const roleName = await this.resolveRoleName(user);

  const accessToken = this.generateAccessToken(user as any, roleName);
  const newRefreshToken = this.generateRefreshToken(user as any);

  await this.userModel.findByIdAndUpdate(user._id, {
    refreshTokenHash: this.hashToken(newRefreshToken),
  });

  return { accessToken, refreshToken: newRefreshToken };
}

  async logout(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $unset: { refreshTokenHash: 1 },
    });

    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string) {
    return {
      message: 'Email verification is not required on this platform — your account is already active.',
    };
  }


 async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      return { message: 'If this email exists, a reset link has been sent' };
    }

    const resetToken = this.generateResetToken(user._id.toString(), user.email!);
    
    // Explicitly fallback to localhost:3000 if FRONTEND_URL is missing
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    
    // Updated to match your frontend route path: /auth/resetPassword
    const resetUrl = `${frontendUrl}/auth/resetPassword?token=${resetToken}`;
    
    await this.mailService.sendPasswordReset(user.email!, resetUrl);

    return { message: 'If this email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    let payload: any;
    try {
      payload = this.jwtService.verify(token!, {
        secret: this.configService.get<string>('JWT_RESET_PASSWORD') ||
          this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
    } catch (e) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userModel.findOne({ email: payload.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(
      newPassword!,
      Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS')) || 10,
    );

    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      $unset: { refreshTokenHash: 1 }, 
    });

    return { message: 'Password reset successfully' };
  }


  async forgotPasswordMobile(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      return { message: 'If this email exists, a reset link has been sent' };
    }

    const resetToken = this.generateResetToken(user._id.toString(), user.email!);
    
    // Explicitly target mobile local server or scheme (localhost:8081)
    const mobileUrl = this.configService.get<string>('MOBILE_FRONTEND_URL') || 'http://localhost:8081';
    const resetUrl = `${mobileUrl}/auth/ResetPassword?token=${resetToken}`;
    
    await this.mailService.sendPasswordReset(user.email!, resetUrl);

    return { message: 'If this email exists, a reset link has been sent' };
  }

  async resetPasswordMobile(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    let payload: any;
    try {
      payload = this.jwtService.verify(token!, {
        secret: this.configService.get<string>('JWT_RESET_PASSWORD') ||
          this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
    } catch (e) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userModel.findOne({ email: payload.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(
      newPassword!,
      Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS')) || 10,
    );

    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      $unset: { refreshTokenHash: 1 }, 
    });

    return { message: 'Password reset successfully' };
  }

async getProfile(userId: string) {
  // 1. Fetch the user
  const user = await this.userModel
    .findById(userId)
    .populate('roles')
    .select('-password -refreshTokenHash')
    .lean();

  if (!user) throw new NotFoundException('User not found');

  // 2. Fetch the customer using the user ID reference
  const customer = await this.customerModel.findOne({ user: new Types.ObjectId(userId) }).lean();

  // 3. Return a merged object
  return {
    ...user,
    phone: customer?.phone || '',
    address: customer?.address || '',
  };
}



async updateProfile(userId: string, dto: any): Promise<any> {
  console.log('[updateProfile] userId:', userId, 'dto:', JSON.stringify(dto));


  await this.userModel.findByIdAndUpdate(userId, {
    name: dto.name,
    email: dto.email
  }, { new: true }).exec();

  const userObjectId = new Types.ObjectId(userId);

  const customer = await this.customerModel.findOneAndUpdate(
    { user: userObjectId },
    { 
      $set: { 
        name: dto.name,
        email: dto.email,
        phone: dto.phone, 
        address: dto.address 
      } 
    },
    { new: true, upsert: true }
  ).exec();

  console.log('[updateProfile] matched/updated customer:', customer?._id?.toString());

  if (!customer) {
    throw new Error('customer profile not found');
  }

  return customer.toObject();
}
}