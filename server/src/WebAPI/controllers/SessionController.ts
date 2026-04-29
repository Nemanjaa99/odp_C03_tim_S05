import { Request, Response, Router } from "express";
import { ISessionService } from "../../Domain/services/sessions/ISessionService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { Session } from "../../Domain/models/Session";

export class SessionController {
  private router: Router;

  constructor(private sessionService: ISessionService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/sessions", authenticate, this.getMySessions.bind(this));
    this.router.post("/sessions", authenticate, this.create.bind(this));
    this.router.get("/sessions/:id", authenticate, this.getById.bind(this));
    this.router.put("/sessions/:id", authenticate, this.update.bind(this));
    this.router.delete("/sessions/:id", authenticate, this.delete.bind(this));
    this.router.post("/sessions/:id/players", authenticate, this.addPlayer.bind(this));
    this.router.patch("/sessions/:id/players/:userId", authenticate, this.updatePlayer.bind(this));
    this.router.delete("/sessions/:id/players/:userId", authenticate, this.removePlayer.bind(this));
  }

  /** GET /api/v1/sessions  [user] */
  private async getMySessions(req: Request, res: Response): Promise<void> {
    try {
      const sessions = await this.sessionService.getByUserId(req.user!.id);
      res.status(200).json({ success: true, data: sessions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** POST /api/v1/sessions  [user] */
  private async create(req: Request, res: Response): Promise<void> {
    try {
      const { game_id, played_at, duration_min, notes } = req.body;
      if (!game_id || !played_at) {
        res.status(400).json({ success: false, message: "game_id i played_at su obavezni." });
        return;
      }
      const session = new Session(0, game_id, req.user!.id, played_at, duration_min ?? 60, notes ?? null);
      const result = await this.sessionService.create(session);
      if (result.id !== 0) {
        res.status(201).json({ success: true, message: "Sesija kreirana.", data: result });
      } else {
        res.status(500).json({ success: false, message: "Greška pri kreiranju sesije." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** GET /api/v1/sessions/:id  [user] */
  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      const session = await this.sessionService.getById(id);
      if (session.id === 0) {
        res.status(404).json({ success: false, message: "Sesija nije pronađena." });
        return;
      }
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** PUT /api/v1/sessions/:id  [user - samo kreator] */
  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      const { played_at, duration_min, notes } = req.body;
      const session = new Session(id, 0, 0, played_at, duration_min, notes ?? null);
      const result = await this.sessionService.update(session, req.user!.id);
      if (result.success) {
        res.status(200).json({ success: true, message: result.message, data: result.data });
      } else {
        res.status(403).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** DELETE /api/v1/sessions/:id  [user - samo kreator] */
  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      const result = await this.sessionService.delete(id, req.user!.id);
      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(403).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** POST /api/v1/sessions/:id/players  [user] */
  private async addPlayer(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = parseInt(req.params["id"] as string);
      const { user_id } = req.body;
      if (!user_id) {
        res.status(400).json({ success: false, message: "user_id je obavezan." });
        return;
      }
      const success = await this.sessionService.addPlayer(sessionId, user_id);
      res.status(success ? 201 : 400).json({ success, message: success ? "Učesnik dodat." : "Greška." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** PATCH /api/v1/sessions/:id/players/:userId  [user] */
  private async updatePlayer(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = parseInt(req.params["id"] as string);
      const userId = parseInt(req.params["userId"] as string);
      const { score, winner } = req.body;
      const success = await this.sessionService.updatePlayer(sessionId, userId, score ?? null, winner ?? false);
      res.status(success ? 200 : 404).json({ success, message: success ? "Učesnik ažuriran." : "Učesnik nije pronađen." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** DELETE /api/v1/sessions/:id/players/:userId  [user] */
  private async removePlayer(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = parseInt(req.params["id"] as string);
      const userId = parseInt(req.params["userId"] as string);
      const success = await this.sessionService.removePlayer(sessionId, userId);
      res.status(success ? 200 : 404).json({ success, message: success ? "Učesnik uklonjen." : "Učesnik nije pronađen." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}