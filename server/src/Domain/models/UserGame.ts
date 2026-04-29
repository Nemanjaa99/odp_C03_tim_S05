export class UserGame {
  constructor(
    public user_id: number = 0,
    public game_id: number = 0,
    public status: "owned" | "wishlist" | "previously_owned" = "owned",
    public personal_rating: number | null = null,
    public notes: string | null = null,
    public added_at?: Date,
    public game?: {
      id: number;
      title: string;
      cover_image: string | null;
      min_players: number;
      max_players: number;
      duration_min: number;
      weight: number;
      year: number;
      publisher: string;
      mechanics: string[];
    }
  ) {}
}