import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IUserService } from "../../Domain/services/users/IUserService";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getAll(): Promise<UserDto[]> {
    const users = await this.userRepository.getAll();
    return users.map(
      (u) => new UserDto(u.id, u.username, u.full_name, u.email, u.role, u.profile_image, u.created_at)
    );
  }

  async getById(id: number): Promise<UserDto> {
    const u = await this.userRepository.getById(id);
    if (u.id === 0) return new UserDto();
    return new UserDto(u.id, u.username, u.full_name, u.email, u.role, u.profile_image, u.created_at);
  }

  async updateRole(id: number, role: string): Promise<boolean> {
    return this.userRepository.updateRole(id, role);
  }
}