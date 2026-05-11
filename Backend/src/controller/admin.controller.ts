import { Request, Response } from 'express';
import { getUserDetails } from '../services/authRole.service.js';
import { adminServices } from '../services/admin.service.js';

class AdminClass {
  // dashboard route
  dashboardChart = async (req: Request, res: Response) => {
    try {
      const stats = await adminServices.getChartDataService();
      return res.status(200).json(stats);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res
          .status(500)
          .json({ message: 'Error loading dashboard', error: error.message || error });
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
          message: 'No file detected.',
        });
      }

      if (!chunkIndex || !uploadId || !totalChunks) {
        return res.status(400).json({
          message: 'Missing metadata fields',
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
        { userID: userDetails.userID, userRole: userDetails.userRole },
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
}

export const adminCtr = new AdminClass();
