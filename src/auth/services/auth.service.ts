import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { User } from "../../user/schemas/user.schema";
import { Patient } from "../../patient/schemas/patient.schema";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { Role } from "../../roles/schemas/role.schema";
import { RoleEnum } from "../../common/enums/role.enum";
import { CreatePatientDTO } from "../../patient/dtos/create-patient.dto";
import { LoginDto } from "../dtos/login.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "../dtos/reset-password.dto";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private jwtService: JwtService,
  ) {}

 
  async register(dto: CreatePatientDTO) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const role = await this.roleModel.findOne({ name: RoleEnum.PATIENT });
    if (!role) {
      throw new BadRequestException("PATIENT role is not seeded in the database");
    }

    const hashedPassword = await bcrypt.hash(dto.password as string, SALT_ROUNDS);

    const patient = await this.patientModel.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone,
      address: dto.address,
      role: role._id,
    });

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      isVerified: true,
      isActive: true,
      roles: role._id,
      patients: patient._id,
    });

    patient.user = user._id as any;
    await patient.save();

    const tokens = await this.issueTokens(user._id.toString());
    return {
      message: "Registration successful",
      user: this.sanitizeUser(user, role),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email }).populate("roles");

    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account has been suspended");
    }

    const passwordMatches = await bcrypt.compare(dto.password!, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const tokens = await this.issueTokens(user._id.toString());
    return {
      message: "Login successful",
      user: this.sanitizeUser(user, user.roles as any),
      ...tokens,
    };
  }




  async refreshToken(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user || !(user as any).refreshTokenHash) {
      throw new UnauthorizedException("Refresh token is no longer valid");
    }

    const matches = await bcrypt.compare(refreshToken, (user as any).refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException("Refresh token is no longer valid");
    }

    return this.issueTokens(user._id.toString());
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $unset: { refreshTokenHash: 1 },
    });
    return { message: "Logged out successfully" };
  }

  async verifyEmail(token: string) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_VERIFY_SECRET || process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new BadRequestException("Invalid or expired verification link");
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new BadRequestException("Invalid verification link");
    }

    user.isVerified = true;
    await user.save();
    return { message: "Email verified successfully" };
  }

 
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      return { message: "If that email exists, a reset link has been sent" };
    }

    const resetToken = this.jwtService.sign(
      { sub: user._id.toString() },
      {
        secret: process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET,
        expiresIn: "15m",
      },
    );
    return {
      message: "If that email exists, a reset link has been sent",
      resetToken, 
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(dto.token!, {
        secret: process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new BadRequestException("Invalid reset token");
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword!, SALT_ROUNDS);
    user.password! = hashedPassword;
    await user.save();

    if (user.patients) {
      await this.patientModel.findByIdAndUpdate(user.patients, {
        password: hashedPassword,
      });
    }

    return { message: "Password reset successfully" };
  }


  private async issueTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User, role: Role | null) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isActive: user.isActive,
      role: role?.name,
    };
  }

  private generateTemporaryPassword(): string {
    return crypto.randomBytes(6).toString("base64url");
  }
}