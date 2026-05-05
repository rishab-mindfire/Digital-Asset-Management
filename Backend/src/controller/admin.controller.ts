import { Request, Response } from 'express';
import { getUserDetails } from '../services/authRole.service.js';
import { adminServices } from '../services/admin.service.js';
import { AssetModel } from '../models/asset.model.js';
import { UsageTrackingModel } from '../models/usagetracking.model.js';

class AdminClass {
  getOverview = async (req: Request, res: Response) => {
    try {
      const stats = await adminServices.getDashboardStats();
      return res.status(200).json({ summary: stats });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res
          .status(500)
          .json({ message: 'Error loading dashboard', error: error.message || error });
      }
    }
  };

  getAllAssets = async (req: Request, res: Response) => {
    try {
      const result = await adminServices.assetListingService(req.query);
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
      if (!req.userEmail) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      const userDetails = await getUserDetails(req.userEmail);
      if (!userDetails) {
        return res.status(404).json({ message: 'User details not found' });
      }

      const assetData = await adminServices.getAssetFullDetail(req.params.id as string, {
        userID: userDetails.userID,
        userEmail: userDetails.userEmail,
      });

      if (!assetData) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      return res.status(200).json(assetData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res
          .status(500)
          .json({ message: 'Error loading asset details', error: error.message || error });
      }
    }
  };

  deleteAsset = async (req: Request, res: Response) => {
    try {
      await adminServices.removeAsset(req.params.id as string);
      return res.status(200).json({ message: 'Asset moved to archive' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ message: 'Delete failed', error: error.message || error });
      }
    }
  };

  // upload file
  uploadChunk = async (req: Request, res: Response) => {
    try {
      const { chunkIndex, uploadId, totalChunks } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          message: 'No file detected. key is "file" and type is "File".',
        });
      }

      if (!chunkIndex || !uploadId || !totalChunks) {
        return res.status(400).json({
          message: 'Missing metadata fields in form-data.',
        });
      }

      const result = await adminServices.handleChunkUpload(uploadId, file, {
        chunkIndex,
        totalChunks,
      });

      return res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({
          message: 'Chunk upload failed',
          error: error.message,
        });
      }
    }
  };

  //merge chunk
  mergeChunks = async (req: Request, res: Response) => {
    try {
      if (!req.userEmail) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const { uploadId, filename, totalChunks, title, department, collectionId, expiryDate } =
        req.body;

      if (!uploadId || !filename || !totalChunks) {
        return res.status(400).json({
          message: 'Invalid payload: uploadId, filename, and totalChunks are required.',
        });
      }

      const userDetails = await getUserDetails(req.userEmail);
      if (!userDetails) {
        return res.status(404).json({ message: 'User details not found' });
      }

      const asset = await adminServices.finalizeMerge(
        uploadId,
        { title, department, collectionId, expiryDate },
        { userID: userDetails.userID, userEmail: userDetails.userEmail },
      );

      return res.status(201).json({
        message: 'All chunks merged. File is pending background processing.',
        asset,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({
          message: 'Merging failed',
          error: error.message,
        });
      }
    }
  };

  //stream video
  async streamVideo(req: Request, res: Response) {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const userDetails = await getUserDetails(userEmail);
      if (!userDetails) {
        return res.status(404).json({ message: 'User details not found' });
      }
      //  Fetch the Asset from DB
      const asset = await AssetModel.findById(req.params.id);
      if (!asset || !asset.localPath) {
        return res.sendStatus(404);
      }

      //  Log usage tracking safely
      try {
        await UsageTrackingModel.create({
          assetId: asset._id,
          performerId: userDetails.userID,
          performerEmail: userDetails.userEmail,
          action: 'view',
          metadata: {
            originalFilename: asset.title || 'N/A no file name ',
          },
        });
      } catch (logError: unknown) {
        // Log quietly so tracking errors don't interrupt the actual streaming
        if (logError instanceof Error) {
          throw new Error(logError.message);
        }
      }

      //Retrieve video file data via the Service
      const videoMetadata = await adminServices.getFileMetadata(asset.localPath);
      const videoSize = videoMetadata.size;
      const range = req.headers.range;

      //  A: Client does not send a Range header (Serve full file)
      if (!range) {
        const headers = {
          'Content-Length': videoSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, headers);
        return adminServices.createFullStream(asset.localPath).pipe(res);
      }

      //  B: Client requests a specific Range chunk
      const CHUNK_SIZE = 10 ** 6; // 1MB
      const start = Number(range.replace(/\D/g, ''));
      const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

      const contentLength = end - start + 1;
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, headers);
      const videoStream = adminServices.createStreamChunk(asset.localPath, start, end);
      videoStream.pipe(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'CastError') {
          return res.status(400).json({
            message: 'Invalid ID format',
            error: error.message,
          });
        }

        return res.status(500).json({
          message: 'Error streaming asset',
          error: error.message || error,
        });
      }
    }
  }
}

export const adminCtr = new AdminClass();
