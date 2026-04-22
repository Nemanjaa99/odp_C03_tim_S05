import { AuditLog } from "../../models/AuditLog";

export interface IAuditRepository {
  log(entry: Omit<AuditLog, "id" | "created_at">): Promise<void>;
  getAll(): Promise<AuditLog[]>;
}