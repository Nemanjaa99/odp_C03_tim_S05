import { IGameService } from "../../Domain/services/games/IGameService";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { Game } from "../../Domain/models/Game";

export class GameService implements IGameService {
  constructor(private gameRepository: IGameRepository) {}

  async getAll(): Promise<Game[]> {
    return this.gameRepository.getAll();
  }

  async getById(id: number): Promise<Game> {
    return this.gameRepository.getById(id);
  }

  async create(game: Game, mechanicIds: number[]): Promise<Game> {
    return this.gameRepository.create(game, mechanicIds);
  }

  async update(game: Game, mechanicIds: number[]): Promise<Game> {
    return this.gameRepository.update(game, mechanicIds);
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const hasUsers = await this.gameRepository.hasUsers(id);
    if (hasUsers) {
      return { success: false, message: "Igra se ne može obrisati jer je u kolekciji korisnika." };
    }
    const deleted = await this.gameRepository.delete(id);
    if (deleted) return { success: true, message: "Igra uspešno obrisana." };
    return { success: false, message: "Igra nije pronađena." };
  }
}
