import { Review } from "../../models/Review";

export interface IReviewService {
  getByGameId(gameId: number): Promise<Review[]>;
  create(review: Review, userId: number): Promise<{ success: boolean; data?: Review; message: string }>;
  update(review: Review, userId: number): Promise<{ success: boolean; data?: Review; message: string }>;
  delete(reviewId: number, userId: number): Promise<{ success: boolean; message: string }>;
}