/* eslint-disable quotes */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoleBased from './middlewares/authRoleBased.middleware.js';
import { userRouter } from './router/user.routes.js';
import { adminRouter } from './router/admin.routes.js';
import { publicRouter } from './router/public.routes.js';
import logRouter from './router/logRoute.route.js';
import helmet from 'helmet';

const app = express();
const frontend_url = process.env.FRONTEND_URL || 'http://localhost:3001';

// CORS Policy
const corsOptions = {
  origin: [frontend_url],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization', 'Content-Disposition'],
};
app.use(cors(corsOptions));
app.use(cookieParser());

//  Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 * 10000000000000, // number of requests for testing
  message: 'Too many requests, please try again later.',
});
// log limiter
const logLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Stricter limit for logs
  message: 'Log limit exceeded for this IP.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Use standard helmet protections
app.use(helmet());
//centralized CSP policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3001'],
    },
  }),
);
// X-Frame-Options (Clickjacking Protection)
app.use(helmet.frameguard({ action: 'deny' }));
//X-XSS-Protection
app.use(helmet.xssFilter());

// Log Route: Very strict payload limit (2kb )
app.use('/api', logLimiter, express.json({ limit: '2kb' }), logRouter);
//  Body json size and Parsing
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(globalLimiter);

// Routes
//  API Endpoints
app.use('/user', userRouter);
app.use('/admin', authRoleBased('admin'), adminRouter);
app.use('/public', authRoleBased('public'), publicRouter);

app.get('/', (req, res) => {
  res.send('Server is running and secure.');
});

export default app;
