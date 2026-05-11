import { Request, Response } from 'express';
import { getUserDetails } from '../services/authRole.service.js';
import { assetService } from '../services/asset.service.js';
import { streamAsset } from '../helper/stream.helper.js';

class AssetAdmin {
  // Assets
  getAllAssets = async (req: Request, res: Response) => {
    try {
      const result = await assetService.assetListingService(req.query);
      return res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res
          .status(500)
          .json({ message: 'Error fetching assets', error: error.message || error });
      }
    }
  };

  getAssetById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      const { userEmail } = req;

      // chaeck for user email
      if (!userEmail) {
        return res.status(401).json({ message: 'Unauthorized: No user email provided' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Asset ID is required' });
      }

      // Check if you actually need to fetch userDetails
      const userDetails = await getUserDetails(userEmail);
      if (!userDetails) {
        return res.status(404).json({ message: 'User profile not found' });
      }

      // Fetch Asset Data
      const assetData = await assetService.getAssetFullDetail(id, {
        userID: userDetails.userID,
        userEmail: userDetails.userEmail,
      });

      if (!assetData || !assetData.asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }

      // Streaming Logic
      // Validate localPath exists before passing to streamAsset to prevent 500 errors
      const filePath = assetData.asset.localPath;
      const isStreamRequested = req.headers.range || req.query.stream === 'true';

      if (isStreamRequested) {
        if (!filePath) {
          return res
            .status(422)
            .json({ message: 'Asset exists but is not available for streaming' });
        }
        // Ensure streamAsset handles the response internally
        return streamAsset(res, filePath, req.headers.range as string);
      }

      // Standard JSON Response
      return res.status(200).json(assetData);
    } catch (error: unknown) {
      // Log the specific ID and User
      console.error(`Error fetching asset ${req.params.id}:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        message: 'Internal server error while loading asset',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      });
    }
  };

  metaDataDetalis = async (req: Request, res: Response) => {
    try {
      if (!req.userEmail) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      //grab user details
      const userDetails = await getUserDetails(req.userEmail);
      if (!userDetails) {
        return res.status(404).json({ message: 'User details not found' });
      }
      // call asset details
      const assetData = await assetService.getAssetMetadata(req.params.id as string);
      if (!assetData) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      // Return the JSON metadata
      return res.status(200).json(assetData);
    } catch (error: unknown) {
      console.error(error);
      return res.status(500).json({
        message: 'Error loading asset',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  markApprove = async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      const { userEmail } = req;
      // check for user email
      if (!userEmail) {
        return res.status(401).json({ message: 'Unauthorized: No user email provided' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Asset ID is required' });
      }
      const data = await assetService.markApprove(id);
      return res.status(200).json(data);
    } catch (error: unknown) {
      // Log error
      console.error(`Error fetching asset ${req.params.id}:`, error);
      return res.status(500).json({
        message: 'Internal server error while marking ',
      });
    }
  };

  deleteAssetById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      if (!id) {
        return res.status(400).json({ message: 'Asset ID is required' });
      }
      await assetService.deleteAsset(req.params.id as string);
      return res.status(200).json({ message: 'Asset moved to archive' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ message: 'Delete failed', error: error.message || error });
      }
    }
  };
}

export const assetAdmin = new AssetAdmin();
