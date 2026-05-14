import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { handleControllerError } from '../utils/globleError.js';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    const dbConnected = mongoose.connection.readyState === 1;

    res.status(200).json({
      success: true,
      uptime: process.uptime(),
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleControllerError(res, error, 'Health check failed');
  }
};
