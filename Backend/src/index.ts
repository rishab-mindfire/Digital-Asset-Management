import express, { Express, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { userRouter } from './router/user.routes.js';
import logRouter from './router/logRoute.route.js';
import { adminRouter } from './router/admin.routes.js';
import { publicRouter } from './router/public.routes.js';
import { configureSecurity, corsOptions } from './config/security.config.js';
import authRoleBased from './middlewares/authRoleBased.middleware.js';
import { globalLimiter, logLimiter } from './config/limits.config.js';
const app: Express = express();

// Security and Core Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
configureSecurity(app);

// Log Route (Specific Parser & Limiter)
app.use('/api', logLimiter, express.json({ limit: '2kb' }), logRouter);

// Global Parsing & Rate Limiting
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(globalLimiter);

// API Endpoints
app.use('/user', userRouter);
app.use('/admin', authRoleBased('admin'), adminRouter);
app.use('/public', authRoleBased('public'), publicRouter);

// Health Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('TS Server is running and secure.');
});

export default app;
