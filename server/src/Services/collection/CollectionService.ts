import { ICollectionService } from "../../Domain/services/collection/ICollectionService";
import { ICollectionRepository } from "../../Domain/repositories/collection/ICollectionRepository";
import { UserGame } from "../../Domain/models/UserGame";

export class CollectionService implements ICollectionService {
  constructor(private collectionRepository: ICollectionRepository) {}

  async getByUserId(userId: number): Promise<UserGame[]> {
    return this.collectionRepository.getByUserId(userId);
  }

  async add(
    userId: number, gameId: number, status: string,
    personal_rating: number | null, notes: string | null
  ): Promise<UserGame> {
    const exists = await this.collectionRepository.exists(userId, gameId);
    if (exists) return new UserGame();
    return this.collectionRepository.add(
      new UserGame(userId, gameId, status as "owned" | "wishlist" | "previously_owned", personal_rating, notes)
    );
  }

  async update(
    userId: number, gameId: number, status: string,
    personal_rating: number | null, notes: string | null
  ): Promise<UserGame> {
    return this.collectionRepository.update(
      new UserGame(userId, gameId, status as "owned" | "wishlist" | "previously_owned", personal_rating, notes)
    );
  }

  async remove(userId: number, gameId: number): Promise<boolean> {
    return this.collectionRepository.remove(userId, gameId);
  }
}