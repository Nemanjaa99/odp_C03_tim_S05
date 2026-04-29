import { Session, SessionPlayer } from "../../models/Session";

export interface ISessionRepository {
  create(session: Session): Promise<Session>;
  getById(id: number): Promise<Session>;
  getByUserId(userId: number): Promise<Session[]>;
  update(session: Session): Promise<Session>;
  delete(id: number): Promise<boolean>;
  addPlayer(sessionId: number, userId: number): Promise<boolean>;
  updatePlayer(sessionId: number, userId: number, score: number | null, winner: boolean): Promise<boolean>;
  removePlayer(sessionId: number, userId: number): Promise<boolean>;
  isCreator(sessionId: number, userId: number): Promise<boolean>;
}