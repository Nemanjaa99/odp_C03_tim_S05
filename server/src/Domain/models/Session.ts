export class Session {
  constructor(
    public id: number = 0,
    public game_id: number = 0,
    public creator_id: number = 0,
    public played_at: string = "",
    public duration_min: number = 60,
    public notes: string | null = null,
    public created_at?: Date,
    public game_title?: string,
    public players?: SessionPlayer[]
  ) {}
}

export class SessionPlayer {
  constructor(
    public session_id: number = 0,
    public user_id: number = 0,
    public score: number | null = null,
    public winner: boolean = false,
    public username?: string
  ) {}
}