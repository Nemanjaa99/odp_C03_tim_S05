import { Request, Response, Router } from "express";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { validateLogin, validateRegister } from "../../WebAPI/validators/auth/authValidator";
import jwt from "jsonwebtoken";

export class AuthController {
  private router: Router;

  constructor(private authService: IAuthService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/auth/register", this.register.bind(this));
    this.router.post("/auth/login", this.login.bind(this));
    this.router.post("/auth/logout", authenticate, this.logout.bind(this));
  }

  /**
   * POST /api/v1/auth/register
   */
  private async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, full_name, email, password, profile_image } = req.body;

      const validation = validateRegister(username, full_name, email, password);
      if (!validation.uspesno) {
        res.status(400).json({ success: false, message: validation.poruka });
        return;
      }

      const result = await this.authService.register(
        username,
        full_name,
        email,
        password,
        profile_image ?? null
      );

      if (result.id !== 0) {
        const token = jwt.sign(
          { id: result.id, username: result.username, role: result.role },
          process.env.JWT_SECRET ?? "",
          { expiresIn: "6h" }
        );
        res.status(201).json({ success: true, message: "Uspešna registracija", data: token });
      } else {
        res.status(409).json({ success: false, message: "Korisničko ime ili email već postoji." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const validation = validateLogin(username, password);
      if (!validation.uspesno) {
        res.status(400).json({ success: false, message: validation.poruka });
        return;
      }

      const result = await this.authService.login(username, password);

      if (result.id !== 0) {
        const token = jwt.sign(
          { id: result.id, username: result.username, role: result.role },
          process.env.JWT_SECRET ?? "",
          { expiresIn: "6h" }
        );
        res.status(200).json({ success: true, message: "Uspešna prijava", data: token });
      } else {
        res.status(401).json({ success: false, message: "Neispravno korisničko ime ili lozinka." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  private async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const ip = req.ip ?? "unknown";
      await this.authService.logout(userId, ip);
      res.status(200).json({ success: true, message: "Uspešna odjava." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}