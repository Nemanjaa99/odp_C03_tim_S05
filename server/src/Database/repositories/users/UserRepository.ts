import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import { User } from "../../../Domain/models/User";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    try {
      const query = `
        INSERT INTO users (username, full_name, email, password_hash, role, profile_image)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        user.username,
        user.full_name,
        user.email,
        user.password_hash,
        user.role,
        user.profile_image,
      ]);
      if (result.insertId) {
        return new User(result.insertId, user.username, user.full_name, user.email, user.password_hash, user.role, user.profile_image);
      }
      return new User();
    } catch (error) {
      console.error("Error creating user:", error);
      return new User();
    }
  }

  async getById(id: number): Promise<User> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [id]);
      if (rows.length > 0) {
        const r = rows[0];
        return new User(r.id, r.username, r.full_name, r.email, r.password_hash, r.role, r.profile_image, r.created_at);
      }
      return new User();
    } catch { return new User(); }
  }

  async getByUsername(username: string): Promise<User> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(`SELECT * FROM users WHERE username = ?`, [username]);
      if (rows.length > 0) {
        const r = rows[0];
        return new User(r.id, r.username, r.full_name, r.email, r.password_hash, r.role, r.profile_image, r.created_at);
      }
      return new User();
    } catch { return new User(); }
  }

  async getByEmail(email: string): Promise<User> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(`SELECT * FROM users WHERE email = ?`, [email]);
      if (rows.length > 0) {
        const r = rows[0];
        return new User(r.id, r.username, r.full_name, r.email, r.password_hash, r.role, r.profile_image, r.created_at);
      }
      return new User();
    } catch { return new User(); }
  }

  async getAll(): Promise<User[]> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(`SELECT * FROM users ORDER BY id ASC`);
      return rows.map((r) => new User(r.id, r.username, r.full_name, r.email, r.password_hash, r.role, r.profile_image, r.created_at));
    } catch { return []; }
  }

  async update(user: User): Promise<User> {
    try {
      const query = `UPDATE users SET username = ?, full_name = ?, email = ?, profile_image = ? WHERE id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [user.username, user.full_name, user.email, user.profile_image, user.id]);
      if (result.affectedRows > 0) return user;
      return new User();
    } catch { return new User(); }
  }

  async updateRole(id: number, role: string): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(`UPDATE users SET role = ? WHERE id = ?`, [role, id]);
      return result.affectedRows > 0;
    } catch { return false; }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(`DELETE FROM users WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    } catch { return false; }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) as count FROM users WHERE id = ?`, [id]);
      return rows[0].count > 0;
    } catch { return false; }
  }
}