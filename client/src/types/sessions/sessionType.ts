export interface SessionPlayer {
  session_id: number;
  user_id: number;
  score: number | null;
  winner: boolean;
  username?: string;
}

export interface Session {
  id: number;
  game_id: number;
  creator_id: number;
  played_at: string;
  duration_min: number;
  notes: string | null;
  created_at?: string;
  game_title?: string;
  players?: SessionPlayer[];
}