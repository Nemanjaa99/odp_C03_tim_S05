import { UserAuthDataDto } from "../../DTOs/auth/UserAuthDataDto";

export interface IAuthService {
  login(username: string, password: string): Promise<UserAuthDataDto>;
  register(
    username: string,
    full_name: string,
    email: string,
    password: string,
    profile_image: string | null
  ): Promise<UserAuthDataDto>;
  logout(userId: number, ip: string): Promise<void>;
}