import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ConflictException, HttpException, HttpStatus,} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../../user/schemas/user.schema';
import { Patient } from '../../patient/schemas/patient.schema';
import { Role } from '../../roles/schemas/role.schema';
import { RoleEnum } from '../../common/enums/role.enum';
import { MailService } from '../../common/mail/mail.service';
import { CreatePatientDTO } from '../../patient/dtos/create-patient.dto';
import { LoginDto } from '../dtos/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../dtos/reset-password.dto';
import { Logger } from '@nestjs/common';
import { JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private generateAccessToken(user: User & { _id: Types.ObjectId }, roleName?: string): string {
  const payload = {
    sub: user._id.toString(),
    email: user.email ?? '',
    role: roleName ?? 'PATIENT',
  };

  // 👈 Explicitly pass the secret directly here to guarantee token signing values!
  return this.jwtService.sign(payload, {
    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    expiresIn: '15m',
  });
}



// ... inside your class
private generateRefreshToken(user: User & { _id: Types.ObjectId }): string {
  const payload = {
    sub: user._id.toString(),
    email: user.email ?? '',
  };
  
  const secret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
  
  // Cast the config result to 'any' to bypass the strict index.d.ts validation
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


  async register(dto: CreatePatientDTO) {
    const { name, email, address, phone, password } = dto;

    const existingEmail = await this.patientModel.findOne({ email });
    if (existingEmail) {
      throw new ConflictException('Patient with this email already exists');
    }

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const patientRole = await this.roleModel.findOne({ name: RoleEnum.PATIENT });
    if (!patientRole) {
      throw new NotFoundException('Patient role not found');
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
      roles: patientRole._id,
    });

    const patient = await this.patientModel.create({
      name,
      email,
      address,
      phone,
      role: patientRole._id,
      user: user._id,
    });

    await patient.populate({ path: 'user', populate: { path: 'roles' } });

    await this.mailService.sendPatientWelcomeEmail({
      to: email!,
      name: name!,
      email: email!,
      password,
    });

    return {
      message: 'Registration successful. You can now log in.',
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
      },
    };
  }

 
async login(dto: LoginDto) {
  const { email, password } = dto;

  const user = await this.userModel.findOne({ email }).populate('roles');
  
  // LOGGING: Helps pinpoint exactly which condition fails
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

  // Use the same hashing library consistently (recommend switching all to 'bcrypt')
  const isPasswordValid = await bcrypt.compare(password!, user.password!);
  if (!isPasswordValid) {
    this.logger.warn(`Login failed: Password mismatch for ${email}`);
    throw new UnauthorizedException('Invalid email or password');
  }

  const roleName = (user.roles as any)?.name;
  const accessToken = this.generateAccessToken(user as any, roleName);
  const refreshToken = this.generateRefreshToken(user as any);

  // Use the same bcrypt library for the refresh hash
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
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

    if (!user.refreshTokenHash) {
      throw new UnauthorizedException('Session has been revoked. Please log in again.');
    }

    const isTokenValid = await bcrypt.compare(token, user.refreshTokenHash);
    if (!isTokenValid) {
      throw new UnauthorizedException('Session has been revoked. Please log in again.');
    }

    const roleName = (user.roles as any)?.name;

    const accessToken = this.generateAccessToken(user as any, roleName);
    const newRefreshToken = this.generateRefreshToken(user as any);

    const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await this.userModel.findByIdAndUpdate(user._id, { refreshTokenHash });

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
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
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


async getProfile(userId: string) {
  // 1. Fetch the user
  const user = await this.userModel
    .findById(userId)
    .populate('roles')
    .select('-password -refreshTokenHash')
    .lean();

  if (!user) throw new NotFoundException('User not found');

  // 2. Fetch the patient using the user ID reference
  const patient = await this.patientModel.findOne({ user: new Types.ObjectId(userId) }).lean();

  // 3. Return a merged object
  return {
    ...user,
    phone: patient?.phone || '',
    address: patient?.address || '',
  };
}


// async updateProfile(userId: string, dto: any): Promise<any> {
//   // 1. Update User name/email
//   await this.userModel.findByIdAndUpdate(userId, {
//     name: dto.name,
//     email: dto.email
//   }).exec();

//   // 2. Update Patient phone/address (Use user reference)
//   const patient = await this.patientModel.findOneAndUpdate(
//     { user: new Types.ObjectId(userId) },
//     { 
//       $set: { 
//         phone: dto.phone, 
//         address: dto.address 
//       } 
//     },
//     { new: true, upsert: true }
//   ).exec();

//   return patient.toObject();
// }

async updateProfile(userId: string, dto: any): Promise<any> {
  console.log('[updateProfile] userId:', userId, 'dto:', JSON.stringify(dto));

  // 1. Update the User collection (credentials / identity)
  await this.userModel.findByIdAndUpdate(userId, {
    name: dto.name,
    email: dto.email
  }, { new: true }).exec();

  // 2. Update the Patient collection (since Patient also stores name, email, phone, address)
  const userObjectId = new Types.ObjectId(userId);

  const patient = await this.patientModel.findOneAndUpdate(
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

  console.log('[updateProfile] matched/updated patient:', patient?._id?.toString());

  if (!patient) {
    throw new Error('Patient profile not found');
  }

  return patient.toObject();
}
}