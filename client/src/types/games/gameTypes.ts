export interface Game {
  id: number;
  title: string;
  description: string;
  cover_image: string | null;
  min_players: number;
  max_players: number;
  duration_min: number;
  weight: number;
  year: number;
  publisher: string;
  created_at?: string;
  mechanics?: string[];
}