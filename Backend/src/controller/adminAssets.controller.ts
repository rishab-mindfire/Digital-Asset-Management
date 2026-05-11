import { Request, Response } from 'express';
import { getUserDetails } from '../services/authRole.service.js';
import { assetService } from '../services/asset.service.js';
import { streamAsset } from '../helper/stream.helper.js';
import { AppError } from '../utils/globleError.js';

/**
 * Controller for managing individual assets and streaming services.
 */
class AssetAdmin {
  // Retrieve paginated and filtered list of all assets
  getAllAssets = async (req: Request, res: Response) => {
    try {
      const result = await assetService.assetListingService(req.query);
      return res.status(200).json(result);
    } catch (error: unknown) {
      this.handleControllerError(res, error, 'Error fetching assets');
    }
  };

  // Fetch full details of a specific asset with optional video streaming
  getAssetById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      const { userEmail } = req;

      if (!userEmail) {
        throw new AppError('Unauthorized: No user email provided', 401);
      }
      if (!id) {
        throw new AppError('Asset ID is required', 400);
      }

      const userDetails = await getUserDetails(userEmail);
      if (!userDetails) {
        throw new AppError('User profile not found', 404);
      }

      const assetData = await assetService.getAssetFullDetail(id, {
        userID: userDetails.userID,
        userEmail: userDetails.userEmail,
      });

      if (!assetData?.asset) {
        throw new AppError('Asset not found', 404);
      }

      const filePath = assetData.asset.localPath;
      const isStreamRequested = req.headers.range || req.query.stream === 'true';

      // Handle byte-range requests for video streaming
      if (isStreamRequested) {
        if (!filePath) {
          throw new AppError('Asset exists but is not available for streaming', 422);
        }
        return streamAsset(res, filePath, req.headers.range as string);
      }

      return res.status(200).json(assetData);
    } catch (error: unknown) {
      this.handleControllerError(res, error, 'Internal server error while loading asset');
    }
  };

  // Extract technical metadata from a specific asset
  metaDataDetalis = async (req: Request, res: Response) => {
    try {
      if (!req.userEmail) {
        throw new AppError('Invalid token', 401);
      }

      const userDetails = await getUserDetails(req.userEmail);
      if (!userDetails) {
        throw new AppError('User details not found', 404);
      }

      const assetData = await assetService.getAssetMetadata(req.params.id as string);
      if (!assetData) {
        throw new AppError('Asset not found', 404);
      }

      return res.status(200).json(assetData);
    } catch (error: unknown) {
      this.handleControllerError(res, error, 'Error loading asset metadata');
    }
  };

  // Approve a pending asset for production use
  markApprove = async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      if (!req.userEmail) {
        throw new AppError('Unauthorized', 401);
      }
      if (!id) {
        throw new AppError('Asset ID is required', 400);
      }

      const data = await assetService.markApprove(id);
      return res.status(200).json(data);
    } catch (error: unknown) {
      this.handleControllerError(res, error, 'Internal server error while marking approval');
    }
  };

  // Remove asset from system and trigger cleanup
  deleteAssetController = async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      const result = await assetService.deleteAssetService(id);
      return res.status(200).json(result);
    } catch (error: unknown) {
      this.handleControllerError(res, error, 'Asset deletion failed');
    }
  };

  // Centralized response helper for consistent error delivery
  private handleControllerError(res: Response, error: unknown, defaultMessage: string) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : defaultMessage;
    return res.status(statusCode).json({ message, error: message });
  }
}

export const assetAdmin = new AssetAdmin();
