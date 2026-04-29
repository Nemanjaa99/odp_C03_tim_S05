import { Request, Response, Router } from "express";
import { IReviewService } from "../../Domain/services/reviews/IReviewService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { Review } from "../../Domain/models/Review";

export class ReviewController {
  private router: Router;

  constructor(private reviewService: IReviewService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/reviews/game/:gameId", this.getByGameId.bind(this));
    this.router.post("/reviews", authenticate, this.create.bind(this));
    this.router.put("/reviews/:id", authenticate, this.update.bind(this));
    this.router.delete("/reviews/:id", authenticate, this.delete.bind(this));
  }

  /** GET /api/v1/reviews/game/:gameId  [public] */
  private async getByGameId(req: Request, res: Response): Promise<void> {
    try {
      const gameId = parseInt(req.params["gameId"] as string);
      const reviews = await this.reviewService.getByGameId(gameId);
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** POST /api/v1/reviews  [user] */
  private async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { game_id, title, body, rating } = req.body;
      if (!game_id || !title || !body || !rating) {
        res.status(400).json({ success: false, message: "Sva polja su obavezna." });
        return;
      }
      if (body.length < 50) {
        res.status(400).json({ success: false, message: "Telo recenzije mora imati najmanje 50 karaktera." });
        return;
      }
      if (rating < 1 || rating > 10) {
        res.status(400).json({ success: false, message: "Ocena mora biti između 1 i 10." });
        return;
      }
      const review = new Review(0, userId, game_id, title, body, rating);
      const result = await this.reviewService.create(review, userId);
      res.status(result.success ? 201 : 409).json({ success: result.success, message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** PUT /api/v1/reviews/:id  [user - samo vlasnik] */
  private async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params["id"] as string);
      const { game_id, title, body, rating } = req.body;
      if (body && body.length < 50) {
        res.status(400).json({ success: false, message: "Telo recenzije mora imati najmanje 50 karaktera." });
        return;
      }
      const review = new Review(id, userId, game_id, title, body, rating);
      const result = await this.reviewService.update(review, userId);
      res.status(result.success ? 200 : 403).json({ success: result.success, message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /** DELETE /api/v1/reviews/:id  [user - samo vlasnik] */
  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params["id"] as string);
      const result = await this.reviewService.delete(id, userId);
      res.status(result.success ? 200 : 403).json({ success: result.success, message: result.message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}