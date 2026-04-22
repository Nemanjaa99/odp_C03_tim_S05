import { IAuditRepository } from "../../../Domain/repositories/audit/IAuditRepository";
import { AuditLog } from "../../../Domain/models/AuditLog";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class AuditRepository implements IAuditRepository {
  async log(entry: Omit<AuditLog, "id" | "created_at">): Promise<void> {
    try {
      const query = `
        INSERT INTO audit_log (user_id, action, entity, entity_id, meta, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await db.execute<ResultSetHeader>(query, [
        entry.user_id,
        entry.action,
        entry.entity,
        entry.entity_id,
        entry.meta,
        entry.ip_address,
      ]);
    } catch (error) {
      console.error("Audit log error:", error);
    }
  }

  async getAll(): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT al.*, u.username
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
      `;
      const [rows] = await db.execute<RowDataPacket[]>(query);
      return rows.map(
        (r) =>
          new AuditLog(
            r.id,
            r.user_id,
            r.action,
            r.entity,
            r.entity_id,
            r.meta,
            r.ip_address,
            r.created_at,
            r.username
          )
      );
    } catch {
      return [];
    }
  }
}