import { IReviewRepository } from "../../../Domain/repositories/reviews/IReviewRepository";
import { Review } from "../../../Domain/models/Review";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class ReviewRepository implements IReviewRepository {
  async getByGameId(gameId: number): Promise<Review[]> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.game_id = ? ORDER BY r.created_at DESC`,
        [gameId]
      );
      return rows.map((r) => new Review(r.id, r.user_id, r.game_id, r.title, r.body, r.rating, r.created_at, r.updated_at, r.username));
    } catch {
      return [];
    }
  }

  async getByUserAndGame(userId: number, gameId: number): Promise<Review> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.user_id=? AND r.game_id=?`,
        [userId, gameId]
      );
      if (rows.length === 0) return new Review();
      const r = rows[0];
      return new Review(r.id, r.user_id, r.game_id, r.title, r.body, r.rating, r.created_at, r.updated_at, r.username);
    } catch {
      return new Review();
    }
  }

  async create(review: Review): Promise<Review> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO reviews (user_id, game_id, title, body, rating) VALUES (?, ?, ?, ?, ?)`,
        [review.user_id, review.game_id, review.title, review.body, review.rating]
      );
      if (result.insertId) return await this.getByUserAndGame(review.user_id, review.game_id);
      return new Review();
    } catch {
      return new Review();
    }
  }

  async update(review: Review): Promise<Review> {
    try {
      await db.execute<ResultSetHeader>(
        `UPDATE reviews SET title=?, body=?, rating=? WHERE id=?`,
        [review.title, review.body, review.rating, review.id]
      );
      return await this.getByUserAndGame(review.user_id, review.game_id);
    } catch {
      return new Review();
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(`DELETE FROM reviews WHERE id=?`, [id]);
      return result.affectedRows > 0;
    } catch {
      return false;
    }
  }

  async isOwner(reviewId: number, userId: number): Promise<boolean> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM reviews WHERE id=? AND user_id=?`,
        [reviewId, userId]
      );
      return rows[0].count > 0;
    } catch {
      return false;
    }
  }
}