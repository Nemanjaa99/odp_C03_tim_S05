import express from 'express';
import cors from 'cors';
import { UserRepository } from './Database/repositories/users/UserRepository';
import { AuditRepository } from './Database/repositories/audit/AuditRepository';
import { GameRepository } from './Database/repositories/games/GameRepository';
import { MechanicRepository } from './Database/repositories/mechanics/MechanicRepository';
import { CollectionRepository } from './Database/repositories/collection/CollectionRepository';
import { SessionRepository } from './Database/repositories/sessions/SessionRepository';
import { ReviewRepository } from './Database/repositories/reviews/ReviewRepository';
import { AuthService } from './Services/auth/AuthService';
import { UserService } from './Services/users/UserService';
import { GameService } from './Services/games/GameService';
import { MechanicService } from './Services/mechanics/MechanicService';
import { CollectionService } from './Services/collection/CollectionService';
import { SessionService } from './Services/sessions/SessionService';
import { ReviewService } from './Services/reviews/ReviewService';
import { AuthController } from './WebAPI/controllers/AuthController';
import { UserController } from './WebAPI/controllers/UserController';
import { AuditController } from './WebAPI/controllers/AuditController';
import { GameController } from './WebAPI/controllers/GameController';
import { MechanicController } from './WebAPI/controllers/MechanicController';
import { CollectionController } from './WebAPI/controllers/CollectionController';
import { SessionController } from './WebAPI/controllers/SessionController';
import { ReviewController } from './WebAPI/controllers/ReviewController';

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Repositories
const userRepository = new UserRepository();
const auditRepository = new AuditRepository();
const gameRepository = new GameRepository();
const mechanicRepository = new MechanicRepository();
const collectionRepository = new CollectionRepository();
const sessionRepository = new SessionRepository();
const reviewRepository = new ReviewRepository();

// Services
const authService = new AuthService(userRepository, auditRepository);
const userService = new UserService(userRepository);
const gameService = new GameService(gameRepository);
const mechanicService = new MechanicService(mechanicRepository);
const collectionService = new CollectionService(collectionRepository);
const sessionService = new SessionService(sessionRepository);
const reviewService = new ReviewService(reviewRepository);

// Controllers
const authController = new AuthController(authService);
const userController = new UserController(userService);
const auditController = new AuditController(auditRepository);
const gameController = new GameController(gameService);
const mechanicController = new MechanicController(mechanicService);
const collectionController = new CollectionController(collectionService);
const sessionController = new SessionController(sessionService);
const reviewController = new ReviewController(reviewService);

// Routes
app.use('/api/v1', authController.getRouter());
app.use('/api/v1', userController.getRouter());
app.use('/api/v1', auditController.getRouter());
app.use('/api/v1', gameController.getRouter());
app.use('/api/v1', mechanicController.getRouter());
app.use('/api/v1', collectionController.getRouter());
app.use('/api/v1', sessionController.getRouter());
app.use('/api/v1', reviewController.getRouter());

export default app;