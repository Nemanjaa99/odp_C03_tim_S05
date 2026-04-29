import { Review } from "../../models/Review";

export interface IReviewRepository {
  getByGameId(gameId: number): Promise<Review[]>;
  getByUserAndGame(userId: number, gameId: number): Promise<Review>;
  create(review: Review): Promise<Review>;
  update(review: Review): Promise<Review>;
  delete(id: number): Promise<boolean>;
  isOwner(reviewId: number, userId: number): Promise<boolean>;
}