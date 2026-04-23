import { Game } from "../../models/Game";

export interface IGameRepository {
  create(game: Game, mechanicIds: number[]): Promise<Game>;
  getById(id: number): Promise<Game>;
  getAll(): Promise<Game[]>;
  update(game: Game, mechanicIds: number[]): Promise<Game>;
  delete(id: number): Promise<boolean>;
  hasUsers(id: number): Promise<boolean>;
}
