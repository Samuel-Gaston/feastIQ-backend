import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { JwtStrategy } from "../common/strategies/jwt.strategy";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Patient, PatientSchema } from "../patient/schemas/patient.schema";
import { Doctor, DoctorSchema } from "../doctor/schemas/doctor.schema";
import { Role, RoleSchema } from "../roles/schemas/role.schema";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: "15m" },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}