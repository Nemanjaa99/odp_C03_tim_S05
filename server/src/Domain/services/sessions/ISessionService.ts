import { Session } from "../../models/Session";

export interface ISessionService {
  getByUserId(userId: number): Promise<Session[]>;
  getById(id: number): Promise<Session>;
  create(session: Session): Promise<Session>;
  update(session: Session, requesterId: number): Promise<{ success: boolean; data?: Session; message: string }>;
  delete(id: number, requesterId: number): Promise<{ success: boolean; message: string }>;
  addPlayer(sessionId: number, userId: number): Promise<boolean>;
  updatePlayer(sessionId: number, userId: number, score: number | null, winner: boolean): Promise<boolean>;
  removePlayer(sessionId: number, userId: number): Promise<boolean>;
}