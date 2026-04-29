// Main Application Entry Point
// Configures Express middleware, security headers, and API routing
// Handles environment-specific variable loading for production and development
// Orchestrates the connection between the database layer and server routes
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoleBased from './middlewares/authRoleBased.middleware.js';
import { userRouter } from './router/user.routes.js';
import connectDB from './config/connectDB.config.js';
import { adminRouter } from './router/admin.routes.js';
import { managerRouter } from './router/manager.routes.js';
import assetRouter from './router/asset.routes.js';

// Determine environment file based on the current execution mode
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.dev';
dotenv.config({ path: envFile });

const app = express();

// Set allowed origin for cross-origin requests from the environment or default
const frontend_url: string = process.env.FRONTEND_URL || 'http://localhost:3001';

// Define security and credential options for CORS policy
const corsOptions = {
  origin: [frontend_url],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
};

app.use(cors(corsOptions));

// Enable parsing of JSON payloads and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register application routes and apply role-based authentication to dashboard
app.use('/user', userRouter);
app.use('/admin-dashboard', authRoleBased('admin'), assetRouter);
app.use('/manager-dashboard', authRoleBased('manager'), managerRouter);

// Execute the database connection logic
connectDB().catch();

// Simple health check endpoint to confirm server availability
app.get('/', (req, res) => {
  res.send('Server is running...');
});

export default app;
