import express from 'express';
import cors from 'cors';
import { UserRepository } from './Database/repositories/users/UserRepository';
import { AuditRepository } from './Database/repositories/audit/AuditRepository';
import { AuthService } from './Services/auth/AuthService';
import { UserService } from './Services/users/UserService';
import { AuthController } from './WebAPI/controllers/AuthController';
import { UserController } from './WebAPI/controllers/UserController';
import { AuditController } from './WebAPI/controllers/AuditController';

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Repositories
const userRepository = new UserRepository();
const auditRepository = new AuditRepository();

// Services
const authService = new AuthService(userRepository, auditRepository);
const userService = new UserService(userRepository);

// Controllers
const authController = new AuthController(authService);
const userController = new UserController(userService);
const auditController = new AuditController(auditRepository);

// Routes
app.use('/api/v1', authController.getRouter());
app.use('/api/v1', userController.getRouter());
app.use('/api/v1', auditController.getRouter());

export default app;