import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ReviewService } from "../services/review.service";
import { CreateReviewDTO, UpdateReviewDTO } from "../dtos/create-review.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { RoleEnum } from "../../common/enums/role.enum";
import { Roles } from "../../common/decorators/role.decorator";
import { PermissionCode } from "../../common/enums/permission.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { User } from "../../user/schemas/user.schema";

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 404, description: 'NOT FOUND' })
@ApiResponse({ status: 400, description: 'BAD_REQUEST' })
@ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
@ApiResponse({ status: 403, description: 'FORBIDDEN' })
@ApiResponse({ status: 422, description: 'VALIDATION_FAILED' })
@ApiResponse({ status: 500, description: 'SERVER_ERROR' })
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ─── DOCTOR/PATIENT: Create a review ──────────────────────────────
  @Post()
  @Roles(RoleEnum.DOCTOR, RoleEnum.PATIENT)
  @ApiOperation({ summary: 'Doctor or Patient creates a review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async create(
    @Body() dto: CreateReviewDTO,
    @CurrentUser() user: User,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.reviewService.createReview(dto, user);
    return { data: response, message: i18n.t("common.REVIEW_CREATE") };
  }

  // ─── DOCTOR/PATIENT: Get my own reviews ───────────────────────────
  @Get('my')
  @Roles(RoleEnum.DOCTOR, RoleEnum.PATIENT)
  @ApiOperation({ summary: 'Get reviews written by the logged-in user' })
  async getMyReviews(
    @CurrentUser() user: User,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.reviewService.getMyReviews((user._id as any).toString());
    return { data: response, message: i18n.t("common.REVIEW_GET_MY") };
  }

  // ─── DOCTOR/PATIENT: Update own review ────────────────────────────
  @Patch(':id')
  @Roles(RoleEnum.DOCTOR, RoleEnum.PATIENT)
  @ApiOperation({ summary: 'Update own review' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDTO,
    @CurrentUser() user: User,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.reviewService.updateReview(id, dto, (user._id as any).toString());
    return { data: response, message: i18n.t("common.REVIEW_UPDATE") };
  }

  // ─── ADMIN: Get all reviews ────────────────────────────────────────
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionCode.REVIEW_READ)
  @ApiOperation({ summary: 'Admin gets all reviews' })
  async getAllReviews(@I18n() i18n: I18nContext) {
    const response = await this.reviewService.getAllReviews();
    return { data: response, message: i18n.t("common.REVIEWS_FETCHED") };
  }

  // FIXED: separate prefix "role" to avoid conflict with :id
  // ─── ADMIN: Get reviews filtered by role ──────────────────────────
  @Get('role/doctor')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionCode.REVIEW_READ)
  @ApiOperation({ summary: 'Get all reviews made by doctors' })
  async getDoctorReviews(@I18n() i18n: I18nContext) {
    const response = await this.reviewService.getReviewsByRole(RoleEnum.DOCTOR);
    return { data: response, message: i18n.t("common.REVIEW_GET_DOCTOR") };
  }

  @Get('role/patient')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionCode.REVIEW_READ)
  @ApiOperation({ summary: 'Get all reviews made by patients' })
  async getPatientReviews(@I18n() i18n: I18nContext) {
    const response = await this.reviewService.getReviewsByRole(RoleEnum.PATIENT);
    return { data: response, message: i18n.t("common.REVIEW_GET_PATIENT") };
  }

  // ─── ADMIN: Get single review ──────────────────────────────────────
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionCode.REVIEW_READ)
  @ApiOperation({ summary: 'Get a single review by ID' })
  async getOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.reviewService.getReviewById(id);
    return { data: response, message: i18n.t("common.REVIEWS_FETCHED") };
  }

  // ─── ADMIN: Delete review ──────────────────────────────────────────
  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionCode.REVIEW_DELETE)
  @ApiOperation({ summary: 'Admin deletes a review' })
  async delete(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.reviewService.deleteReview(id);
    return { data: response, message: i18n.t("common.REVIEW_DELETE") };
  }
}