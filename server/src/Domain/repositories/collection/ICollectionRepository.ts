import { UserGame } from "../../models/UserGame";

export interface ICollectionRepository {
  getByUserId(userId: number): Promise<UserGame[]>;
  add(userGame: UserGame): Promise<UserGame>;
  update(userGame: UserGame): Promise<UserGame>;
  remove(userId: number, gameId: number): Promise<boolean>;
  exists(userId: number, gameId: number): Promise<boolean>;
}