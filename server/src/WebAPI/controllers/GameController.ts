import { Request, Response, Router } from "express";
import { IGameService } from "../../Domain/services/games/IGameService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { validateGame } from "../../WebAPI/validators/games/gameValidator";
import { Game } from "../../Domain/models/Game";

export class GameController {
  private router: Router;

  constructor(private gameService: IGameService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/games", this.getAll.bind(this));
    this.router.get("/games/:id", this.getById.bind(this));
    this.router.post("/games", authenticate, authorize("admin"), this.create.bind(this));
    this.router.put("/games/:id", authenticate, authorize("admin"), this.update.bind(this));
    this.router.delete("/games/:id", authenticate, authorize("admin"), this.delete.bind(this));
  }

  /**
   * GET /api/v1/games  [public]
   */
  private async getAll(req: Request, res: Response): Promise<void> {
    try {
      const games = await this.gameService.getAll();
      res.status(200).json({ success: true, data: games });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /**
   * GET /api/v1/games/:id  [public]
   */
  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Nevažeći ID." });
        return;
      }
      const game = await this.gameService.getById(id);
      if (game.id === 0) {
        res.status(404).json({ success: false, message: "Igra nije pronađena." });
        return;
      }
      res.status(200).json({ success: true, data: game });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /**
   * POST /api/v1/games  [admin]
   */
  private async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, cover_image, min_players, max_players, duration_min, weight, year, publisher, mechanic_ids } = req.body;

      const validation = validateGame(title, min_players, max_players, duration_min, weight, year, publisher);
      if (!validation.uspesno) {
        res.status(400).json({ success: false, message: validation.poruka });
        return;
      }

      const game = new Game(0, title, description ?? "", cover_image ?? null, min_players, max_players, duration_min, weight, year, publisher);
      const result = await this.gameService.create(game, mechanic_ids ?? []);

      if (result.id !== 0) {
        res.status(201).json({ success: true, message: "Igra uspešno dodata.", data: result });
      } else {
        res.status(500).json({ success: false, message: "Greška pri dodavanju igre." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /**
   * PUT /api/v1/games/:id  [admin]
   */
  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      const { title, description, cover_image, min_players, max_players, duration_min, weight, year, publisher, mechanic_ids } = req.body;

      const validation = validateGame(title, min_players, max_players, duration_min, weight, year, publisher);
      if (!validation.uspesno) {
        res.status(400).json({ success: false, message: validation.poruka });
        return;
      }

      const game = new Game(id, title, description ?? "", cover_image ?? null, min_players, max_players, duration_min, weight, year, publisher);
      const result = await this.gameService.update(game, mechanic_ids ?? []);

      if (result.id !== 0) {
        res.status(200).json({ success: true, message: "Igra uspešno izmenjena.", data: result });
      } else {
        res.status(404).json({ success: false, message: "Igra nije pronađena." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /**
   * DELETE /api/v1/games/:id  [admin]
   */
  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Nevažeći ID." });
        return;
      }
      const result = await this.gameService.delete(id);
      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(400).json({ success: false, message: result.message });
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
