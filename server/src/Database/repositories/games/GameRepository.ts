import { IGameRepository } from "../../../Domain/repositories/games/IGameRepository";
import { Game } from "../../../Domain/models/Game";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class GameRepository implements IGameRepository {
  async create(game: Game, mechanicIds: number[]): Promise<Game> {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const query = `
        INSERT INTO games (title, description, cover_image, min_players, max_players, duration_min, weight, year, publisher)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await conn.execute<ResultSetHeader>(query, [
        game.title, game.description, game.cover_image,
        game.min_players, game.max_players, game.duration_min,
        game.weight, game.year, game.publisher,
      ]);

      const gameId = result.insertId;

      if (mechanicIds.length > 0) {
        const values = mechanicIds.map(() => "(?, ?)").join(", ");
        const params = mechanicIds.flatMap((mid) => [gameId, mid]);
        await conn.execute(`INSERT INTO game_mechanics (game_id, mechanic_id) VALUES ${values}`, params);
      }

      await conn.commit();
      return await this.getById(gameId);
    } catch (error) {
      await conn.rollback();
      console.error("Error creating game:", error);
      return new Game();
    } finally {
      conn.release();
    }
  }

  async getById(id: number): Promise<Game> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(`SELECT * FROM games WHERE id = ?`, [id]);
      if (rows.length === 0) return new Game();
      const g = rows[0];

      const [mechRows] = await db.execute<RowDataPacket[]>(
        `SELECT m.name FROM mechanics m JOIN game_mechanics gm ON m.id = gm.mechanic_id WHERE gm.game_id = ?`,
        [id]
      );

      return new Game(
        g.id, g.title, g.description, g.cover_image,
        g.min_players, g.max_players, g.duration_min,
        parseFloat(g.weight), g.year, g.publisher, g.created_at,
        mechRows.map((m) => m.name)
      );
    } catch {
      return new Game();
    }
  }

  async getAll(): Promise<Game[]> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(`SELECT * FROM games ORDER BY title ASC`);

      const games = await Promise.all(
        rows.map(async (g) => {
          const [mechRows] = await db.execute<RowDataPacket[]>(
            `SELECT m.name FROM mechanics m JOIN game_mechanics gm ON m.id = gm.mechanic_id WHERE gm.game_id = ?`,
            [g.id]
          );
          return new Game(
            g.id, g.title, g.description, g.cover_image,
            g.min_players, g.max_players, g.duration_min,
            parseFloat(g.weight), g.year, g.publisher, g.created_at,
            mechRows.map((m) => m.name)
          );
        })
      );

      return games;
    } catch {
      return [];
    }
  }

  async update(game: Game, mechanicIds: number[]): Promise<Game> {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const query = `
        UPDATE games SET title=?, description=?, cover_image=?, min_players=?, max_players=?,
        duration_min=?, weight=?, year=?, publisher=? WHERE id=?
      `;
      await conn.execute<ResultSetHeader>(query, [
        game.title, game.description, game.cover_image,
        game.min_players, game.max_players, game.duration_min,
        game.weight, game.year, game.publisher, game.id,
      ]);

      await conn.execute(`DELETE FROM game_mechanics WHERE game_id = ?`, [game.id]);

      if (mechanicIds.length > 0) {
        const values = mechanicIds.map(() => "(?, ?)").join(", ");
        const params = mechanicIds.flatMap((mid) => [game.id, mid]);
        await conn.execute(`INSERT INTO game_mechanics (game_id, mechanic_id) VALUES ${values}`, params);
      }

      await conn.commit();
      return await this.getById(game.id);
    } catch (error) {
      await conn.rollback();
      console.error("Error updating game:", error);
      return new Game();
    } finally {
      conn.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(`DELETE FROM games WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    } catch {
      return false;
    }
  }

  async hasUsers(id: number): Promise<boolean> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM user_games WHERE game_id = ?`, [id]
      );
      return rows[0].count > 0;
    } catch {
      return false;
    }
  }
}
