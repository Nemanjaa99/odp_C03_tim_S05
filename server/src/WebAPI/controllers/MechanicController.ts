import { Request, Response, Router } from "express";
import { IMechanicService } from "../../Domain/services/mechanics/IMechanicService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class MechanicController {
  private router: Router;

  constructor(private mechanicService: IMechanicService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/mechanics", this.getAll.bind(this));
    this.router.post("/mechanics", authenticate, authorize("admin"), this.create.bind(this));
    this.router.delete("/mechanics/:id", authenticate, authorize("admin"), this.delete.bind(this));
  }

  /**
   * GET /api/v1/mechanics  [public]
   */
  private async getAll(req: Request, res: Response): Promise<void> {
    try {
      const mechanics = await this.mechanicService.getAll();
      res.status(200).json({ success: true, data: mechanics });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /**
   * POST /api/v1/mechanics  [admin]
   */
  private async create(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      if (!name || name.trim().length < 2 || name.trim().length > 80) {
        res.status(400).json({ success: false, message: "Naziv mehanike mora imati između 2 i 80 karaktera." });
        return;
      }
      const result = await this.mechanicService.create(name.trim());
      if (result.id !== 0) {
        res.status(201).json({ success: true, message: "Mehanika uspešno dodata.", data: result });
      } else {
        res.status(409).json({ success: false, message: "Mehanika već postoji." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /**
   * DELETE /api/v1/mechanics/:id  [admin]
   */
  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Nevažeći ID." });
        return;
      }
      const result = await this.mechanicService.delete(id);
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
