import { IMechanicService } from "../../Domain/services/mechanics/IMechanicService";
import { IMechanicRepository } from "../../Domain/repositories/mechanics/IMechanicRepository";
import { Mechanic } from "../../Domain/models/Mechanic";

export class MechanicService implements IMechanicService {
  constructor(private mechanicRepository: IMechanicRepository) {}

  async getAll(): Promise<Mechanic[]> {
    return this.mechanicRepository.getAll();
  }

  async create(name: string): Promise<Mechanic> {
    return this.mechanicRepository.create(name);
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const isUsed = await this.mechanicRepository.isUsed(id);
    if (isUsed) {
      return { success: false, message: "Mehanika se ne može obrisati jer je dodeljena igri." };
    }
    const deleted = await this.mechanicRepository.delete(id);
    if (deleted) return { success: true, message: "Mehanika uspešno obrisana." };
    return { success: false, message: "Mehanika nije pronađena." };
  }
}
