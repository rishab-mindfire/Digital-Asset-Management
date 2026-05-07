// All admin services flow to serve admin request from there route
import { AssetModel } from '../models/asset.model.js';
import { CollectionModel } from '../models/collection.model.js';
import { publishToQueue } from '../helper/producer.js';
import fs from 'fs/promises';
import path from 'path';
import { AuthUser, ChunkUploadBody, FinalizeMergeBody } from '../types/index.js';
import {
  getFileSesionDetails,
  mergeFinalChunks,
  saveChunkBasedChunkId,
  saveFileSesionDetails,
} from '../helper/fileHandlers.js';

class AdminServices {
  // dash board data for graph
  async getDashboardStats() {
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const stats = await AssetModel.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            expiringSoon: [
              { $match: { expiryDate: { $gte: now, $lte: thirtyDaysFromNow } } },
              { $count: 'count' },
            ],
            byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
            riskAssets: [{ $match: { isCompliant: false } }, { $count: 'count' }],
          },
        },
      ]);

      return stats[0] || { total: [], expiringSoon: [], byStatus: [], riskAssets: [] };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw Error(error.message);
      }
    }
  }

  // upload chunk Asset
  async handleChunkUpload(uploadId: string, chunk: Express.Multer.File, body: ChunkUploadBody) {
    const chunkIndex = Number.parseInt(body.chunkIndex, 10);
    const totalChunks = Number.parseInt(body.totalChunks, 10);

    // Validation
    if (Number.isNaN(chunkIndex) || Number.isNaN(totalChunks)) {
      throw new Error('chunkIndex and totalChunks must be valid numbers');
    }

    if (chunkIndex < 1 || chunkIndex > totalChunks) {
      throw new Error(`Invalid chunk index: ${chunkIndex}. Range: 1-${totalChunks}`);
    }

    try {
      // Save chunk
      await saveChunkBasedChunkId(uploadId, chunkIndex, chunk.buffer);

      // Save metadata only once
      if (chunkIndex === 1) {
        await saveFileSesionDetails(uploadId, {
          originalFilename: chunk.originalname,
          totalChunks,
          createdAt: new Date(),
        });
      }

      // Upload progress
      return {
        success: true,
        progress: Math.min(Math.round((chunkIndex / totalChunks) * 100), 100),
        chunkIndex,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Filesystem operation failed: ${error.message}`);
      }

      throw new Error('Filesystem operation failed');
    }
  }

  // merge chunk
  async finalizeMerge(uploadId: string, validatedBody: FinalizeMergeBody, user: AuthUser) {
    // Get metadata
    const metadata = await getFileSesionDetails(uploadId);
    const extension = path.extname(metadata.originalFilename).toLowerCase();
    const finalFilename = `${uploadId}${extension}`;

    // Merge chunks
    const finalPath = await mergeFinalChunks(uploadId, metadata.totalChunks, finalFilename);
    const stats = await fs.stat(finalPath);

    // File type detection
    const isVideo = /\.(mp4|webm|mov)$/i.test(extension);

    // Database update
    const asset = await AssetModel.findOneAndUpdate(
      { uploadId },
      {
        uploadId,
        title: validatedBody.title || metadata.originalFilename,
        fileType: isVideo ? 'video' : 'image',
        localPath: finalPath,
        ownerID: user.userID,
        ownerEmail: user.userEmail,
        department: validatedBody.department,
        status: 'pending',
        metadata: {
          extension: extension.replace('.', ''),
          size: stats.size,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    if (!asset) {
      throw new Error('Failed to create asset');
    }

    // Collection handling
    if (validatedBody.collectionId) {
      await CollectionModel.findByIdAndUpdate(validatedBody.collectionId, {
        $addToSet: {
          assets: asset._id,
        },
      });
    }

    // Queue worker
    try {
      await publishToQueue({
        assetId: asset._id.toString(),
        filePath: finalPath,
        fileType: asset.fileType,
      });
    } catch (error: unknown) {
      await AssetModel.findByIdAndUpdate(asset._id, {
        status: 'error',
      });

      if (error instanceof Error) {
        throw new Error(`Merged successful but queue processing failed: ${error.message}`);
      }

      throw new Error('Merged successful but failed to trigger processing worker');
    }

    return asset;
  }
}

export const adminServices = new AdminServices();
