import { Request, Response, Router } from "express";
import { ICollectionService } from "../../Domain/services/collection/ICollectionService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";

export class CollectionController {
  private router: Router;

  constructor(private collectionService: ICollectionService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/collection", authenticate, this.getCollection.bind(this));
    this.router.post("/collection", authenticate, this.addGame.bind(this));
    this.router.put("/collection/:gameId", authenticate, this.updateGame.bind(this));
    this.router.delete("/collection/:gameId", authenticate, this.removeGame.bind(this));
  }

  /** GET /api/v1/collection  [user] */
  private async getCollection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const collection = await this.collectionService.getByUserId(userId);
      res.status(200).json({ success: true, data: collection });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** POST /api/v1/collection  [user] */
  private async addGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { game_id, status, personal_rating, notes } = req.body;
      if (!game_id) {
        res.status(400).json({ success: false, message: "game_id je obavezan." });
        return;
      }
      const result = await this.collectionService.add(userId, game_id, status ?? "owned", personal_rating ?? null, notes ?? null);
      if (result.user_id !== 0) {
        res.status(201).json({ success: true, message: "Igra dodata u kolekciju.", data: result });
      } else {
        res.status(409).json({ success: false, message: "Igra već postoji u kolekciji." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** PUT /api/v1/collection/:gameId  [user] */
  private async updateGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const gameId = parseInt(req.params["gameId"] as string);
      const { status, personal_rating, notes } = req.body;
      const result = await this.collectionService.update(userId, gameId, status ?? "owned", personal_rating ?? null, notes ?? null);
      if (result.user_id !== 0) {
        res.status(200).json({ success: true, message: "Kolekcija ažurirana.", data: result });
      } else {
        res.status(404).json({ success: false, message: "Igra nije u kolekciji." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** DELETE /api/v1/collection/:gameId  [user] */
  private async removeGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const gameId = parseInt(req.params["gameId"] as string);
      const success = await this.collectionService.remove(userId, gameId);
      if (success) {
        res.status(200).json({ success: true, message: "Igra uklonjena iz kolekcije." });
      } else {
        res.status(404).json({ success: false, message: "Igra nije u kolekciji." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}