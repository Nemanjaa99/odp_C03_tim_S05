import { Request, Response, Router } from "express";
import { IUserService } from "../../Domain/services/users/IUserService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class UserController {
  private router: Router;

  constructor(private userService: IUserService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/users/all", authenticate, authorize("admin"), this.getAll.bind(this));
    this.router.get("/users/:id", this.getById.bind(this));
    this.router.put("/users/:id/role", authenticate, authorize("admin"), this.updateRole.bind(this));
  }

  private async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAll();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Nevažeći ID." });
        return;
      }
      const user = await this.userService.getById(id);
      if (user.id === 0) {
        res.status(404).json({ success: false, message: "Korisnik nije pronađen." });
        return;
      }
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  private async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      const { role } = req.body;
      if (!["player", "admin"].includes(role)) {
        res.status(400).json({ success: false, message: "Uloga mora biti 'player' ili 'admin'." });
        return;
      }
      const success = await this.userService.updateRole(id, role);
      if (success) {
        res.status(200).json({ success: true, message: "Uloga uspešno promenjena." });
      } else {
        res.status(404).json({ success: false, message: "Korisnik nije pronađen." });
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