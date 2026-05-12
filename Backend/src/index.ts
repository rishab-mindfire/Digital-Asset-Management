import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoleBased from './middlewares/authRoleBased.middleware.js';
import { userRouter } from './router/user.routes.js';
import { adminRouter } from './router/admin.routes.js';
import { publicRouter } from './router/public.routes.js';
import rateLimit from 'express-rate-limit';

const app = express();

const frontend_url = process.env.FRONTEND_URL || 'http://localhost:3001';
//cros policy :
const corsOptions = {
  origin: [frontend_url],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
};

// Set up rate limiter: maximum of 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the rate limiter to all requests
app.use(limiter);
app.use(cors(corsOptions));
app.use(cookieParser());

// JSON parser for body JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use('/user', userRouter);
app.use('/admin', authRoleBased('admin'), adminRouter);
app.use('/public', authRoleBased('public'), publicRouter);

app.get('/', (req, res) => {
  res.send('Server is running...');
});

export default app;
