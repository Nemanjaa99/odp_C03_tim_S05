import { UserAuthDataDto } from "../../Domain/DTOs/auth/UserAuthDataDto";
import { User } from "../../Domain/models/User";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IAuditRepository } from "../../Domain/repositories/audit/IAuditRepository";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import bcrypt from "bcryptjs";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  constructor(
    private userRepository: IUserRepository,
    private auditRepository: IAuditRepository
  ) {}

  async login(username: string, password: string): Promise<UserAuthDataDto> {
    const user = await this.userRepository.getByUsername(username);
    if (user.id !== 0 && (await bcrypt.compare(password, user.password_hash))) {
      return new UserAuthDataDto(user.id, user.username, user.role);
    }
    return new UserAuthDataDto();
  }

  async register(
    username: string,
    full_name: string,
    email: string,
    password: string,
    profile_image: string | null
  ): Promise<UserAuthDataDto> {
    const existingByUsername = await this.userRepository.getByUsername(username);
    if (existingByUsername.id !== 0) return new UserAuthDataDto();

    const existingByEmail = await this.userRepository.getByEmail(email);
    if (existingByEmail.id !== 0) return new UserAuthDataDto();

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    const newUser = await this.userRepository.create(
      new User(0, username, full_name, email, hashedPassword, "player", profile_image)
    );

    if (newUser.id !== 0) {
      await this.auditRepository.log({
        user_id: newUser.id,
        action: "REGISTER",
        entity: "users",
        entity_id: newUser.id,
        meta: null,
        ip_address: null,
      });
      return new UserAuthDataDto(newUser.id, newUser.username, newUser.role);
    }
    return new UserAuthDataDto();
  }

  async logout(userId: number, ip: string): Promise<void> {
    await this.auditRepository.log({
      user_id: userId,
      action: "LOGOUT",
      entity: "users",
      entity_id: userId,
      meta: null,
      ip_address: ip,
    });
  }
}