import { Mechanic } from "../../models/Mechanic";

export interface IMechanicService {
  getAll(): Promise<Mechanic[]>;
  create(name: string): Promise<Mechanic>;
  delete(id: number): Promise<{ success: boolean; message: string }>;
}
