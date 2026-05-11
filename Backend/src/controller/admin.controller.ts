import { Request, Response } from 'express';
import { getUserDetails } from '../services/authRole.service.js';
import { adminServices } from '../services/admin.service.js';
import { AppError } from '../utils/globleError.js';

/**
 * Controller handling administrative dashboard actions and file management.
 */
class AdminClass {
  // Fetch data for dashboard chart visualizations
  dashboardChart = async (req: Request, res: Response) => {
    try {
      const stats = await adminServices.getChartDataService();
      return res.status(200).json(stats);
    } catch (error: unknown) {
      this.handleControllerError(res, error, 'Error loading dashboard chart');
    }
  };

  // Retrieve summary statistics for dashboard metric cards
  dashboardCardData = async (req: Request, res: Response) => {
    try {
      const stats = await adminServices.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error: unknown) {
      this.handleControllerError(res, error, 'Error loading dashboard cards');
    }
  };

  // Process individual file chunks for resilient uploads
  uploadChunk = async (req: Request, res: Response) => {
    try {
      const { chunkIndex, uploadId, totalChunks } = req.body;
      const file = req.file;

      if (!file) {
        throw new AppError('No file detected.', 400);
      }
      if (!chunkIndex || !uploadId || !totalChunks) {
        throw new AppError('Missing metadata fields', 400);
      }

      const result = await adminServices.handleChunkUpload(uploadId, file, {
        chunkIndex,
        totalChunks,
      });
      return res.status(200).json(result);
    } catch (error: unknown) {
      this.handleControllerError(res, error, 'Chunk upload failed');
    }
  };

  // Combine uploaded chunks and trigger background asset processing
  mergeChunks = async (req: Request, res: Response) => {
    try {
      if (!req.userEmail) {
        throw new AppError('Invalid token', 401);
      }

      const { uploadId, filename, totalChunks, title, department, collectionId, expiryDate } =
        req.body;

      if (!uploadId || !filename || !totalChunks) {
        throw new AppError(
          'Invalid payload: uploadId, filename, and totalChunks are required.',
          400,
        );
      }

      const userDetails = await getUserDetails(req.userEmail);
      if (!userDetails) {
        throw new AppError('User details not found', 404);
      }

      const asset = await adminServices.finalizeMerge(
        uploadId,
        { title, department, collectionId, expiryDate },
        { userID: userDetails.userID, userRole: userDetails.userRole },
      );

      return res.status(201).json({ message: 'Merge complete. Asset pending processing.', asset });
    } catch (error: unknown) {
      this.handleControllerError(res, error, 'Merging failed');
    }
  };

  // Centralized response helper for controller-level error handling
  private handleControllerError(res: Response, error: unknown, defaultMessage: string) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : defaultMessage;
    return res.status(statusCode).json({ message, error: message });
  }
}

export const adminCtr = new AdminClass();
