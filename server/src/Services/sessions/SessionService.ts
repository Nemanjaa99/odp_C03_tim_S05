import { ISessionService } from "../../Domain/services/sessions/ISessionService";
import { ISessionRepository } from "../../Domain/repositories/sessions/ISessionRepository";
import { Session } from "../../Domain/models/Session";

export class SessionService implements ISessionService {
  constructor(private sessionRepository: ISessionRepository) {}

  async getByUserId(userId: number): Promise<Session[]> {
    return this.sessionRepository.getByUserId(userId);
  }

  async getById(id: number): Promise<Session> {
    return this.sessionRepository.getById(id);
  }

  async create(session: Session): Promise<Session> {
    return this.sessionRepository.create(session);
  }

  async update(session: Session, requesterId: number): Promise<{ success: boolean; data?: Session; message: string }> {
    const isCreator = await this.sessionRepository.isCreator(session.id, requesterId);
    if (!isCreator) return { success: false, message: "Samo kreator može izmeniti sesiju." };
    const updated = await this.sessionRepository.update(session);
    if (updated.id !== 0) return { success: true, data: updated, message: "Sesija uspešno izmenjena." };
    return { success: false, message: "Sesija nije pronađena." };
  }

  async delete(id: number, requesterId: number): Promise<{ success: boolean; message: string }> {
    const isCreator = await this.sessionRepository.isCreator(id, requesterId);
    if (!isCreator) return { success: false, message: "Samo kreator može obrisati sesiju." };
    const deleted = await this.sessionRepository.delete(id);
    if (deleted) return { success: true, message: "Sesija uspešno obrisana." };
    return { success: false, message: "Sesija nije pronađena." };
  }

  async addPlayer(sessionId: number, userId: number): Promise<boolean> {
    return this.sessionRepository.addPlayer(sessionId, userId);
  }

  async updatePlayer(sessionId: number, userId: number, score: number | null, winner: boolean): Promise<boolean> {
    return this.sessionRepository.updatePlayer(sessionId, userId, score, winner);
  }

  async removePlayer(sessionId: number, userId: number): Promise<boolean> {
    return this.sessionRepository.removePlayer(sessionId, userId);
  }
}