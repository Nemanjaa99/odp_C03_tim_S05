export class AuditLog {
  constructor(
    public id: number = 0,
    public user_id: number | null = null,
    public action: string = "",
    public entity: string | null = null,
    public entity_id: number | null = null,
    public meta: string | null = null,
    public ip_address: string | null = null,
    public created_at?: Date,
    public username?: string
  ) {}
}