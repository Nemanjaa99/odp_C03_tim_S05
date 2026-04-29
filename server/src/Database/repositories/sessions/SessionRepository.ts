import { ISessionRepository } from "../../../Domain/repositories/sessions/ISessionRepository";
import { Session, SessionPlayer } from "../../../Domain/models/Session";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class SessionRepository implements ISessionRepository {
  async create(session: Session): Promise<Session> {
    try {
      const query = `
        INSERT INTO sessions (game_id, creator_id, played_at, duration_min, notes)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        session.game_id, session.creator_id, session.played_at,
        session.duration_min, session.notes,
      ]);
      if (result.insertId) {
        await db.execute(
          `INSERT INTO session_players (session_id, user_id, score, winner) VALUES (?, ?, NULL, 0)`,
          [result.insertId, session.creator_id]
        );
        return await this.getById(result.insertId);
      }
      return new Session();
    } catch (error) {
      console.error(error);
      return new Session();
    }
  }

  async getById(id: number): Promise<Session> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT s.*, g.title as game_title FROM sessions s JOIN games g ON s.game_id = g.id WHERE s.id = ?`,
        [id]
      );
      if (rows.length === 0) return new Session();
      const s = rows[0];

      const [playerRows] = await db.execute<RowDataPacket[]>(
        `SELECT sp.*, u.username FROM session_players sp JOIN users u ON sp.user_id = u.id WHERE sp.session_id = ?`,
        [id]
      );

      const players = playerRows.map(
        (p) => new SessionPlayer(p.session_id, p.user_id, p.score, Boolean(p.winner), p.username)
      );

      return new Session(s.id, s.game_id, s.creator_id, s.played_at, s.duration_min, s.notes, s.created_at, s.game_title, players);
    } catch {
      return new Session();
    }
  }

  async getByUserId(userId: number): Promise<Session[]> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT DISTINCT s.*, g.title as game_title
         FROM sessions s
         JOIN games g ON s.game_id = g.id
         JOIN session_players sp ON s.id = sp.session_id
         WHERE sp.user_id = ?
         ORDER BY s.played_at DESC`,
        [userId]
      );

      return await Promise.all(rows.map(async (s) => {
        const [playerRows] = await db.execute<RowDataPacket[]>(
          `SELECT sp.*, u.username FROM session_players sp JOIN users u ON sp.user_id = u.id WHERE sp.session_id = ?`,
          [s.id]
        );
        const players = playerRows.map(
          (p) => new SessionPlayer(p.session_id, p.user_id, p.score, Boolean(p.winner), p.username)
        );
        return new Session(s.id, s.game_id, s.creator_id, s.played_at, s.duration_min, s.notes, s.created_at, s.game_title, players);
      }));
    } catch {
      return [];
    }
  }

  async update(session: Session): Promise<Session> {
    try {
      await db.execute<ResultSetHeader>(
        `UPDATE sessions SET played_at=?, duration_min=?, notes=? WHERE id=?`,
        [session.played_at, session.duration_min, session.notes, session.id]
      );
      return await this.getById(session.id);
    } catch {
      return new Session();
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(`DELETE FROM sessions WHERE id=?`, [id]);
      return result.affectedRows > 0;
    } catch {
      return false;
    }
  }

  async addPlayer(sessionId: number, userId: number): Promise<boolean> {
    try {
      await db.execute(
        `INSERT IGNORE INTO session_players (session_id, user_id, score, winner) VALUES (?, ?, NULL, 0)`,
        [sessionId, userId]
      );
      return true;
    } catch {
      return false;
    }
  }

  async updatePlayer(sessionId: number, userId: number, score: number | null, winner: boolean): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        `UPDATE session_players SET score=?, winner=? WHERE session_id=? AND user_id=?`,
        [score, winner ? 1 : 0, sessionId, userId]
      );
      return result.affectedRows > 0;
    } catch {
      return false;
    }
  }

  async removePlayer(sessionId: number, userId: number): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        `DELETE FROM session_players WHERE session_id=? AND user_id=?`,
        [sessionId, userId]
      );
      return result.affectedRows > 0;
    } catch {
      return false;
    }
  }

  async isCreator(sessionId: number, userId: number): Promise<boolean> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM sessions WHERE id=? AND creator_id=?`,
        [sessionId, userId]
      );
      return rows[0].count > 0;
    } catch {
      return false;
    }
  }
}