export class Game {
  constructor(
    public id: number = 0,
    public title: string = "",
    public description: string = "",
    public cover_image: string | null = null,
    public min_players: number = 1,
    public max_players: number = 4,
    public duration_min: number = 30,
    public weight: number = 2.0,
    public year: number = 2000,
    public publisher: string = "",
    public created_at?: Date,
    public mechanics?: string[]
  ) {}
}
