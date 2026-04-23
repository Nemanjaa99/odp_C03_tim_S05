import { Game } from "../../models/Game";

export interface IGameService {
  getAll(): Promise<Game[]>;
  getById(id: number): Promise<Game>;
  create(game: Game, mechanicIds: number[]): Promise<Game>;
  update(game: Game, mechanicIds: number[]): Promise<Game>;
  delete(id: number): Promise<{ success: boolean; message: string }>;
}
