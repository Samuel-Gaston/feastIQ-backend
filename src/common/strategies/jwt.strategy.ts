import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../../user/schemas/user.schema";

export interface JwtPayload {
  sub: string; // userId
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not defined in the environment");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // ...rest unchanged

  async validate(payload: JwtPayload) {
    const user = await this.userModel
      .findById(payload.sub)
      .populate("roles")
      .populate("permissions")
      .populate("doctors")
      .populate("patients")
      .exec();

    if (!user) {
      throw new UnauthorizedException("User no longer exists");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account has been suspended");
    }

    // Existing RolesGuard/PermissionsGuard expect `user.role` (singular) and
    // `user.permissions` as a flat array of permission name strings.
    return {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isActive: user.isActive,
      role: user.roles as any,
      permissions: ((user.permissions as any[]) || []).map((p) => p.name),
      doctor: user.doctors,
      patient: user.patients,
    };
  }
}