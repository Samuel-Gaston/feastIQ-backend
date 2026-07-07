import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config"; // 👈 1. Import this
import { User } from "../../user/schemas/user.schema";

export interface JwtPayload {
  sub: string; 
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 👈 2. Inject ConfigService
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService 
  ) {
   super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET")!, 
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel
      .findById(payload.sub)
      .populate("roles")
      .populate("permissions")
      .exec();

    if (!user) {
      throw new UnauthorizedException("User no longer exists");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account has been suspended");
    }

    return {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.roles,
      permissions: ((user.permissions as any[]) || []).map((p) => p.name),
    };
  }
}