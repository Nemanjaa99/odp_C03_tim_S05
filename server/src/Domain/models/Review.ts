export class Review {
  constructor(
    public id: number = 0,
    public user_id: number = 0,
    public game_id: number = 0,
    public title: string = "",
    public body: string = "",
    public rating: number = 0,
    public created_at?: Date,
    public updated_at?: Date,
    public username?: string
  ) {}
}