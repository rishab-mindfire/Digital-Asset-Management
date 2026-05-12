import { Request, Response } from 'express';
import { handleControllerError } from '../utils/globleError.js';
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
      handleControllerError(res, error, 'Error fetching assets');
    }
  };
}

export const publicCtr = new PublicController();
