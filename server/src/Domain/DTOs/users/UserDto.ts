export class UserDto {
  constructor(
    public id: number = 0,
    public username: string = "",
    public full_name: string = "",
    public email: string = "",
    public role: string = "player",
    public profile_image: string | null = null,
    public created_at?: Date
  ) {}
}