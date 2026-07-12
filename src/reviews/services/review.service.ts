import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Review } from "../schemas/review.schema";
import { Model } from "mongoose";
import { Patient } from "../../patient/schemas/patient.schema";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { CreateReviewDTO } from "../dtos/create-review.dto";
import { User } from "../../user/schemas/user.schema";





@Injectable()
export class ReviewService{
    constructor(
        @InjectModel(Review.name)
        private readonly reviewModel: Model<Review>,

        @InjectModel(Patient.name)
        private readonly patientModel: Model<Patient>,

        @InjectModel(Doctor.name)
        private readonly doctorModel: Model<Doctor>
    ){}


async createReview(dto: CreateReviewDTO, user: User) {
    return this.reviewModel.create({
        reviewer: user._id,
        reviewerRole: user.roles!,
        rating: dto.rating,
        comment: dto.comment
    });
}


    async getAllReviews(): Promise<Review[]>{
        const review = await this.reviewModel.find().populate({path: 'patient'}).populate({path: 'doctor'});
        return review;
    }


    async getReviewById(id: string): Promise<Review>{
        const review = await this.reviewModel.findById(id).populate({path: 'patient'}).populate({path: 'doctor'});
        if(!review){
            throw new HttpException("Review not found", HttpStatus.NOT_FOUND);
        }
        return review;
    }


    async deleteReview(id: string): Promise<void>{
        const existReview = await this.reviewModel.findById(id);
        if(!existReview){
            throw new HttpException("Review not found", HttpStatus.NOT_FOUND);
        }
        await this.reviewModel.findByIdAndDelete(id);
    }


    async updateReview(id: string, dto: CreateReviewDTO): Promise<void>{
        const existReview = await this.reviewModel.findById(id);
        if(!existReview){
            throw new HttpException("Review not found", HttpStatus.NOT_FOUND);
        }

     await this.reviewModel.findByIdAndUpdate(id, dto, { new: true });  

}

async getReviewsByPatient(patientId: string): Promise<Review[]> {
  const existPatient = await this.patientModel.findById(patientId);

  if (!existPatient) {
    throw new HttpException("Patient not found", HttpStatus.NOT_FOUND);
  }

  const reviews = await this.reviewModel.find({ patient: patientId });

  return reviews;
}


  async getReviewsByDoctor(doctorId: string): Promise<Review[]> {
  const existDoctor = await this.doctorModel.findById(doctorId);

  if (!existDoctor) {
    throw new HttpException("doctor not found", HttpStatus.NOT_FOUND);
  }

  const reviews = await this.reviewModel.find({ doctor: doctorId });

  return reviews;
}



}