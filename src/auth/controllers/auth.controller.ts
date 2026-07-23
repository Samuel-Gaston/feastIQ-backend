import {Body, Controller,Get, HttpCode,HttpStatus,Post, Query, Req,UseGuards,} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { I18n, I18nContext } from "nestjs-i18n";
import { AuthService } from "../services/auth.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreatePatientDTO } from "../../patient/dtos/create-patient.dto";
import { LoginDto } from "../dtos/login.dto";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "../dtos/reset-password.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";
import { UpdateUserDto } from "../../user/dtos/update-user.dto";
import { Patch } from "@nestjs/common";
import { UpdatePatientDTO } from "../../patient/dtos/update-patient.dto";


@ApiTags("Auth")
@ApiResponse({ status: 404, description: "NOT FOUND" })
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  @Post("register")
  @ApiOperation({ summary: "Patient self-registration" })
  @ApiResponse({ status: 200, description: "registration successful" })
  async register(@Body() dto: CreatePatientDTO, @I18n() i18n: I18nContext) {
    const response = await this.authService.register(dto);
    const message = i18n.t("common.AUTH_REGISTER");
    return { data: response, message };
  }

  @Post("login")
  @ApiOperation({ summary: "Login for all roles" })
  @ApiResponse({ status: 200, description: "login successful" })
  async login(@Body() dto: LoginDto, @I18n() i18n: I18nContext) {
    const response = await this.authService.login(dto);
    const message = i18n.t("common.AUTH_LOGIN");
    return { data: response, message };
  }


  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
   async getProfile(
      @CurrentUser() user: User,
   ) {
   return this.authService.getProfile(user._id.toString());
   }

    @Patch('update/profile')
    @UseGuards(JwtAuthGuard)
      async updateMyPatientProfile(
      @CurrentUser() user: User,
      @Body() dto:UpdatePatientDTO,
      @I18n() i18n:I18nContext
      ){
         const response = await this.authService.updateProfile(user._id.toString(), dto)
         const message = i18n.t("common.UPDATE_PATIENT_PROFILE")
         return {data:response, message}
      }

  @Post("refresh")
  @ApiOperation({ summary: "Exchange a refresh token for a new access token" })
  @ApiResponse({ status: 200, description: "token refreshed successfully" })
  async refresh(@Body() dto: RefreshTokenDto, @I18n() i18n: I18nContext) {
    const response = await this.authService.refreshToken(dto.refreshToken);
    const message = i18n.t("common.AUTH_TOKEN_REFRESHED");
    return { data: response, message };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Invalidate the current refresh token" })
  @ApiResponse({ status: 200, description: "logout successful" })
  async logout(
     @CurrentUser() user: User,
     @I18n() i18n: I18nContext) {
  const response = await this.authService.logout(user._id.toString());
  const message = i18n.t("common.AUTH_LOGOUT");
  return { data: response, message };
  }

  @Get("verify-email")
  @ApiOperation({ summary: "Verify email address via emailed token" })
  @ApiResponse({ status: 200, description: "email verified successfully" })
  async verifyEmail(@Query("token") token: string, @I18n() i18n: I18nContext) {
    const response = await this.authService.verifyEmail(token);
    const message = i18n.t("common.AUTH_EMAIL_VERIFIED");
    return { data: response, message };
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Send a password reset link" })
  @ApiResponse({ status: 200, description: "reset link sent if email exists" })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @I18n() i18n: I18nContext) {
    const response = await this.authService.forgotPassword(dto);
    const message = i18n.t("common.AUTH_FORGOT_PASSWORD_SENT");
    return { data: response, message };
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password using a reset token" })
  @ApiResponse({ status: 200, description: "password reset successfully" })
  async resetPassword(@Body() dto: ResetPasswordDto, @I18n() i18n: I18nContext) {
    const response = await this.authService.resetPassword(dto);
    const message = i18n.t("common.AUTH_PASSWORD_RESET");
    return { data: response, message };
  }

  @Post("mobile/forgot-password")
  @ApiOperation({ summary: "Send a password reset link for mobile app" })
  @ApiResponse({ status: 200, description: "mobile reset link sent if email exists" })
  async forgotPasswordMobile(@Body() dto: ForgotPasswordDto, @I18n() i18n: I18nContext) {
    const response = await this.authService.forgotPasswordMobile(dto);
    const message = i18n.t("common.AUTH_FORGOT_PASSWORD_SENT");
    return { data: response, message };
  }

  @Post("mobile/reset-password")
  @ApiOperation({ summary: "Reset password using a reset token for mobile app" })
  @ApiResponse({ status: 200, description: "password reset successfully for mobile" })
  async resetPasswordMobile(@Body() dto: ResetPasswordDto, @I18n() i18n: I18nContext) {
    const response = await this.authService.resetPasswordMobile(dto);
    const message = i18n.t("common.AUTH_PASSWORD_RESET");
    return { data: response, message };
  }
}