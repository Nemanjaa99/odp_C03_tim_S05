import { UserGame } from "../../models/UserGame";

export interface ICollectionService {
  getByUserId(userId: number): Promise<UserGame[]>;
  add(userId: number, gameId: number, status: string, personal_rating: number | null, notes: string | null): Promise<UserGame>;
  update(userId: number, gameId: number, status: string, personal_rating: number | null, notes: string | null): Promise<UserGame>;
  remove(userId: number, gameId: number): Promise<boolean>;
}