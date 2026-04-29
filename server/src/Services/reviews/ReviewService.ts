import { IReviewService } from "../../Domain/services/reviews/IReviewService";
import { IReviewRepository } from "../../Domain/repositories/reviews/IReviewRepository";
import { Review } from "../../Domain/models/Review";

export class ReviewService implements IReviewService {
  constructor(private reviewRepository: IReviewRepository) {}

  async getByGameId(gameId: number): Promise<Review[]> {
    return this.reviewRepository.getByGameId(gameId);
  }

  async create(review: Review, userId: number): Promise<{ success: boolean; data?: Review; message: string }> {
    const existing = await this.reviewRepository.getByUserAndGame(userId, review.game_id);
    if (existing.id !== 0) return { success: false, message: "Već ste napisali recenziju za ovu igru." };
    const created = await this.reviewRepository.create(review);
    if (created.id !== 0) return { success: true, data: created, message: "Recenzija uspešno dodata." };
    return { success: false, message: "Greška pri dodavanju recenzije." };
  }

  async update(review: Review, userId: number): Promise<{ success: boolean; data?: Review; message: string }> {
    const isOwner = await this.reviewRepository.isOwner(review.id, userId);
    if (!isOwner) return { success: false, message: "Možete izmeniti samo sopstvenu recenziju." };
    const updated = await this.reviewRepository.update(review);
    if (updated.id !== 0) return { success: true, data: updated, message: "Recenzija uspešno izmenjena." };
    return { success: false, message: "Recenzija nije pronađena." };
  }

  async delete(reviewId: number, userId: number): Promise<{ success: boolean; message: string }> {
    const isOwner = await this.reviewRepository.isOwner(reviewId, userId);
    if (!isOwner) return { success: false, message: "Možete obrisati samo sopstvenu recenziju." };
    const deleted = await this.reviewRepository.delete(reviewId);
    if (deleted) return { success: true, message: "Recenzija uspešno obrisana." };
    return { success: false, message: "Recenzija nije pronađena." };
  }
}