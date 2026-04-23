import { Mechanic } from "../../models/Mechanic";

export interface IMechanicRepository {
  create(name: string): Promise<Mechanic>;
  getAll(): Promise<Mechanic[]>;
  getById(id: number): Promise<Mechanic>;
  delete(id: number): Promise<boolean>;
  isUsed(id: number): Promise<boolean>;
}
