import { Request, Response, Router } from "express";
import { IAuditRepository } from "../../Domain/repositories/audit/IAuditRepository";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class AuditController {
  private router: Router;

  constructor(private auditRepository: IAuditRepository) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/audits/logs", authenticate, authorize("admin"), this.getLogs.bind(this));
  }

  /**
   * GET /api/v1/audits/logs  [admin]
   */
  private async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.auditRepository.getAll();
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}