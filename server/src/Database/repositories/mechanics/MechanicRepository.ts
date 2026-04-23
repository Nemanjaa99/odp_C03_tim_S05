import { IMechanicRepository } from "../../../Domain/repositories/mechanics/IMechanicRepository";
import { Mechanic } from "../../../Domain/models/Mechanic";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class MechanicRepository implements IMechanicRepository {
  async create(name: string): Promise<Mechanic> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO mechanics (name) VALUES (?)`, [name]
      );
      if (result.insertId) return new Mechanic(result.insertId, name);
      return new Mechanic();
    } catch {
      return new Mechanic();
    }
  }

  async getAll(): Promise<Mechanic[]> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(`SELECT * FROM mechanics ORDER BY name ASC`);
      return rows.map((r) => new Mechanic(r.id, r.name));
    } catch {
      return [];
    }
  }

  async getById(id: number): Promise<Mechanic> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(`SELECT * FROM mechanics WHERE id = ?`, [id]);
      if (rows.length > 0) return new Mechanic(rows[0].id, rows[0].name);
      return new Mechanic();
    } catch {
      return new Mechanic();
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(`DELETE FROM mechanics WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    } catch {
      return false;
    }
  }

  async isUsed(id: number): Promise<boolean> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM game_mechanics WHERE mechanic_id = ?`, [id]
      );
      return rows[0].count > 0;
    } catch {
      return false;
    }
  }
}
