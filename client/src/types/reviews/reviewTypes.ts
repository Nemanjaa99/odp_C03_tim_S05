export interface Review {
  id: number;
  user_id: number;
  game_id: number;
  title: string;
  body: string;
  rating: number;
  created_at?: string;
  updated_at?: string;
  username?: string;
}