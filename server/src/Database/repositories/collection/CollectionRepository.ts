import { ICollectionRepository } from "../../../Domain/repositories/collection/ICollectionRepository";
import { UserGame } from "../../../Domain/models/UserGame";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class CollectionRepository implements ICollectionRepository {
  async getByUserId(userId: number): Promise<UserGame[]> {
    try {
      const query = `
        SELECT ug.*, g.id as g_id, g.title, g.cover_image, g.min_players, g.max_players,
               g.duration_min, g.weight, g.year, g.publisher
        FROM user_games ug
        JOIN games g ON ug.game_id = g.id
        WHERE ug.user_id = ?
        ORDER BY ug.added_at DESC
      `;
      const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);

      return await Promise.all(
        rows.map(async (r) => {
          const [mechRows] = await db.execute<RowDataPacket[]>(
            `SELECT m.name FROM mechanics m JOIN game_mechanics gm ON m.id = gm.mechanic_id WHERE gm.game_id = ?`,
            [r.game_id]
          );
          return new UserGame(
            r.user_id, r.game_id,
            r.status, r.personal_rating, r.notes, r.added_at,
            {
              id: r.g_id, title: r.title, cover_image: r.cover_image,
              min_players: r.min_players, max_players: r.max_players,
              duration_min: r.duration_min, weight: parseFloat(r.weight),
              year: r.year, publisher: r.publisher,
              mechanics: mechRows.map((m) => m.name),
            }
          );
        })
      );
    } catch {
      return [];
    }
  }

  async add(userGame: UserGame): Promise<UserGame> {
    try {
      const query = `
        INSERT INTO user_games (user_id, game_id, status, personal_rating, notes)
        VALUES (?, ?, ?, ?, ?)
      `;
      await db.execute<ResultSetHeader>(query, [
        userGame.user_id, userGame.game_id, userGame.status,
        userGame.personal_rating, userGame.notes,
      ]);
      const results = await this.getByUserId(userGame.user_id);
      return results.find((ug) => ug.game_id === userGame.game_id) ?? new UserGame();
    } catch {
      return new UserGame();
    }
  }

  async update(userGame: UserGame): Promise<UserGame> {
    try {
      const query = `
        UPDATE user_games SET status=?, personal_rating=?, notes=?
        WHERE user_id=? AND game_id=?
      `;
      await db.execute<ResultSetHeader>(query, [
        userGame.status, userGame.personal_rating, userGame.notes,
        userGame.user_id, userGame.game_id,
      ]);
      const results = await this.getByUserId(userGame.user_id);
      return results.find((ug) => ug.game_id === userGame.game_id) ?? new UserGame();
    } catch {
      return new UserGame();
    }
  }

  async remove(userId: number, gameId: number): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        `DELETE FROM user_games WHERE user_id=? AND game_id=?`, [userId, gameId]
      );
      return result.affectedRows > 0;
    } catch {
      return false;
    }
  }

  async exists(userId: number, gameId: number): Promise<boolean> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM user_games WHERE user_id=? AND game_id=?`, [userId, gameId]
      );
      return rows[0].count > 0;
    } catch {
      return false;
    }
  }
}