import { Request, Response } from 'express';
import { AppError } from '../utils/globleError.js';
import { publicService } from '../services/public.service.js';

/**
 * Controller for managing individual assets and streaming services.
 */
class PublicController {
  // Retrieve paginated and filtered list of all assets
  getAllAssets = async (req: Request, res: Response) => {
    try {
      const result = await publicService.assetListingService(req.query);
      return res.status(200).json(result);
    } catch (error: unknown) {
      this.handleControllerError(res, error, 'Error fetching assets');
    }
  };

  // Centralized response helper for consistent error delivery
  private handleControllerError(res: Response, error: unknown, defaultMessage: string) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : defaultMessage;
    return res.status(statusCode).json({ message, error: message });
  }
}

export const publicCtr = new PublicController();
