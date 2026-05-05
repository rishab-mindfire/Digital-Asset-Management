//All admin services flow to serve admin request from there route

import { AssetModel } from '../models/asset.model.js';
import { CollectionModel } from '../models/collection.model.js';
import { publishToQueue } from '../helper/producer.js';
import fs from 'fs/promises';
import { createReadStream, promises as fsPromises } from 'fs';
import type { ReadStream } from 'fs';
import path from 'path';
import { UsageTrackingModel } from '../models/usagetracking.model.js';
import mongoose, { FilterQuery } from 'mongoose';
import { StorageService } from './storage.service.js';
import { AuthUser, ChunkUploadBody, FinalizeMergeBody, IAsset } from '../types/index.js';

export interface FileMetadata {
  size: number;
  localPath: string;
}

// const UPLOAD_DIR = process.env.UPLOAD_DIR || './storage/raw';
// const TEMP_DIR = './storage/temp';

class AdminServices {
  // Utility to prevent CastErrors
  private isValidId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
  }
  //dash board data for graph
  async getDashboardStats() {
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
  }
  // ALL asset list

  async assetListingService(query: {
    search?: string;
    type?: string;
    status?: string;
    page?: string;
    limit?: string;
  }) {
    const { search, type, status, page = '1', limit = '10' } = query;

    const pageNum = Number.parseInt(page, 10) || 1;
    const limitNum = Number.parseInt(limit, 10) || 10;

    const filter: FilterQuery<IAsset> = {};

    if (type) {
      filter.fileType = type;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.title = {
        $regex: search,
        $options: 'i',
      };
    }

    const assets = await AssetModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await AssetModel.countDocuments(filter);

    return {
      assets,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  // Single Asset View
  async getAssetFullDetail(assetId: string, user: AuthUser) {
    if (!this.isValidId(assetId)) {
      throw new Error('Invalid asset ID');
    }

    const asset = await AssetModel.findById(assetId);

    if (!asset) {
      return null;
    }

    // Fire-and-forget tracking
    void UsageTrackingModel.create({
      assetId: asset._id,
      performerId: user.userId,
      performerEmail: user.userEmail,
      action: 'view',
      platform: 'Web Dashboard',
    });

    // Increment view count
    void AssetModel.findByIdAndUpdate(assetId, {
      $inc: {
        viewCount: 1,
      },
    });

    // Recent usage history
    const history = await UsageTrackingModel.find({
      assetId,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      asset,
      usageHistory: history,
      versions: asset.versionHistory || [],
    };
  }

  //Archive asset
  async removeAsset(assetId: string) {
    if (!this.isValidId(assetId)) {
      throw new Error(`INVALID_ID: ${assetId} is not a valid ObjectId`);
    }
    return await AssetModel.findByIdAndUpdate(assetId, { status: 'archived' }, { new: true });
  }

  //upload chunk Asset
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
      await StorageService.saveChunk(uploadId, chunkIndex, chunk.buffer);

      // Save metadata only once
      if (chunkIndex === 1) {
        await StorageService.saveMetadata(uploadId, {
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

  async finalizeMerge(uploadId: string, validatedBody: FinalizeMergeBody, user: AuthUser) {
    // Get metadata
    const metadata = await StorageService.getMetadata(uploadId);

    const extension = path.extname(metadata.originalFilename).toLowerCase();

    const finalFilename = `${uploadId}${extension}`;

    // Merge chunks
    const finalPath = await StorageService.mergeChunks(
      uploadId,
      metadata.totalChunks,
      finalFilename,
    );

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
      await publishToQueue('asset_upload_processing', {
        assetId: asset._id.toString(),
        filePath: finalPath,
        fileType: asset.fileType,
      });
    } catch (error: unknown) {
      await AssetModel.findByIdAndUpdate(asset._id, {
        status: 'error',
      });

      if (error instanceof Error) {
        throw new Error(`Merge successful but queue processing failed: ${error.message}`);
      }

      throw new Error('Merge successful but failed to trigger processing worker');
    }

    return asset;
  }

  //get file metadata details
  async getFileMetadata(localPath: string): Promise<FileMetadata> {
    const stat = await fsPromises.stat(localPath);
    return { size: stat.size, localPath };
  }

  createStreamChunk(localPath: string, start: number, end: number): ReadStream {
    return createReadStream(localPath, { start, end });
  }

  createFullStream(localPath: string): ReadStream {
    return createReadStream(localPath);
  }
}

export const adminServices = new AdminServices();
