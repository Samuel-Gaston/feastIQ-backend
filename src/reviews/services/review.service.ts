import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Review } from "../schemas/review.schema";
import { Model, Types } from "mongoose";
import { CreateReviewDTO, UpdateReviewDTO } from "../dtos/create-review.dto";
import {RoleEnum} from "../../common/enums/role.enum";
// user type from JwtStrategy.validate() return
interface AuthUser {
  _id: any;
  name?: string;
  email?: string;
  role?: string;   // FIXED: now a string like "DOCTOR" | "PATIENT"
  roles?: any;     // full populated Role object (backup)
}

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<Review>,
    // FIXED: removed roleModel — no longer needed since role name
    // comes directly from JwtStrategy as a string
  ) {}

  // ─── Create a review ──────────────────────────────────────────────
async createReview(dto: CreateReviewDTO, user: AuthUser): Promise<Review> {
  // Extract the role name safely
  // If user.role is an object, try to access its 'name' property, or fallback to the string
  let roleName = user.role;
  if (typeof roleName === 'object' && roleName !== null) {
    roleName = (roleName as any).name;
  }

  // Double check it matches your Enum
  if (!roleName || !Object.values(RoleEnum).includes(roleName as any)) {
    throw new HttpException(
      "Invalid or missing user role",
      HttpStatus.BAD_REQUEST,
    );
  }

  const review = await this.reviewModel.create({
    reviewer: user._id,
    reviewerName: user.name,
    reviewerRole: roleName, // Now guaranteed to be a string like 'DOCTOR'
    rating: dto.rating,
    comment: dto.comment,
  });

  await review.populate({ path: 'reviewer', select: 'name email' });
  return review;
}

  // ─── Get all reviews (admin) ──────────────────────────────────────
  async getAllReviews(): Promise<Review[]> {
    return this.reviewModel
      .find()
      .populate({ path: 'reviewer', select: 'name email' })
      .sort({ createdAt: -1 });
  }

  // ─── Get single review by ID ──────────────────────────────────────
  async getReviewById(id: string): Promise<Review> {
    const review = await this.reviewModel
      .findById(id)
      .populate({ path: 'reviewer', select: 'name email' });
    if (!review) throw new NotFoundException("Review not found");
    return review;
  }

  // ─── Get reviews filtered by role ────────────────────────────────
  async getReviewsByRole(role: string): Promise<Review[]> {
    return this.reviewModel
      .find({ reviewerRole: role })
      .populate({ path: 'reviewer', select: 'name email' })
      .sort({ createdAt: -1 });
  }

  // ─── Get reviews made by the logged-in user ───────────────────────
  async getMyReviews(userId: string): Promise<Review[]> {
    return this.reviewModel
      .find({ reviewer: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  // ─── Update a review ──────────────────────────────────────────────
  async updateReview(id: string, dto: UpdateReviewDTO, userId: string): Promise<Review> {
    const existReview = await this.reviewModel.findById(id);
    if (!existReview) throw new NotFoundException("Review not found");

    if (existReview.reviewer?.toString() !== userId) {
      throw new HttpException(
        "You can only update your own reviews",
        HttpStatus.FORBIDDEN,
      );
    }

    const updateData: any = {};
    if (dto.rating !== undefined)  updateData.rating = dto.rating;
    if (dto.comment !== undefined) updateData.comment = dto.comment;

    const updated = await this.reviewModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate({ path: 'reviewer', select: 'name email' });

    if (!updated) throw new HttpException("Failed to update review", HttpStatus.INTERNAL_SERVER_ERROR);
    return updated;
  }

  // ─── Delete a review ──────────────────────────────────────────────
  async deleteReview(id: string): Promise<Review> {
    const existReview = await this.reviewModel.findById(id);
    if (!existReview) throw new NotFoundException("Review not found");

    const deleted = await this.reviewModel.findByIdAndDelete(id);
    if (!deleted) throw new HttpException("Failed to delete review", HttpStatus.INTERNAL_SERVER_ERROR);
    return deleted;
  }
}