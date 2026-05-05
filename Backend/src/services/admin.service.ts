//All admin services flow to serve admin request from there route

import { AssetModel } from '../models/asset.model.js';
import { CollectionModel } from '../models/collection.model.js';
import { publishToQueue } from '../helper/producer.js';
import fs from 'fs/promises';
import { createReadStream, createWriteStream, promises as fsPromises } from 'fs';
import type { ReadStream, WriteStream } from 'fs';
import path from 'path';
import { UsageTrackingModel } from '../models/usagetracking.model.js';
import mongoose from 'mongoose';
import { StorageService } from './storage.service.js';

export interface FileMetadata {
  size: number;
  localPath: string;
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || './storage/raw';
const TEMP_DIR = './storage/temp';

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
  async assetListingService(query: any) {
    const { search, type, status, page = 1, limit = 10 } = query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;

    const filter: any = {};
    if (type) {
      filter.fileType = type;
    }
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const assets = await AssetModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await AssetModel.countDocuments(filter);

    return { assets, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
  }
  // Single Asset View
  async getAssetFullDetail(assetId: string, user: { userId: string; userEmail: string }) {
    if (!this.isValidId(assetId)) {
      throw new Error(`INVALID_ID: ${assetId} is not a valid ObjectId`);
    }

    const asset = await AssetModel.findById(assetId);
    if (!asset) {
      return null;
    }

    // Log the view asynchronously
    UsageTrackingModel.create({
      assetId: asset._id,
      performerId: user.userId,
      performerEmail: user.userEmail,
      action: 'view',
      platform: 'Web Dashboard',
    }).catch((err) => console.error('Failed to log tracking:', err));

    AssetModel.findByIdAndUpdate(assetId, { $inc: { downloadCount: 1 } }).catch((err) =>
      console.error('Failed to increment view count:', err),
    );

    const history = await UsageTrackingModel.find({ assetId }).sort({ createdAt: -1 }).limit(10);

    return {
      asset,
      usageHistory: history,
      versions: (asset as any).versionHistory || [],
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
  async handleChunkUpload(uploadId: string, chunk: Express.Multer.File, body: any) {
    // Validation:
    const chunkIndex = parseInt(body.chunkIndex as string, 10);
    const totalChunks = parseInt(body.totalChunks as string, 10);

    if (isNaN(chunkIndex) || isNaN(totalChunks)) {
      throw new Error('chunkIndex and totalChunks must be valid numbers');
    }

    if (chunkIndex < 1 || chunkIndex > totalChunks) {
      throw new Error(`Invalid chunk index: ${chunkIndex}. Range: 1-${totalChunks}`);
    }

    //  Pass to StorageService
    try {
      await StorageService.saveChunk(uploadId, chunkIndex, chunk.buffer);

      //  Handle Metadata on first chunk
      if (chunkIndex === 1) {
        await StorageService.saveMetadata(uploadId, {
          originalFilename: chunk.originalname,
          totalChunks,
          createdAt: new Date(),
        });
      }

      //  Return progress to controller
      return {
        success: true,
        progress: Math.min(Math.round((chunkIndex / totalChunks) * 100), 100),
        chunkIndex,
      };
    } catch (err: any) {
      console.error('StorageService Error:', err);
      throw new Error(`Filesystem operation failed: ${err.message}`);
    }
  }

  async finalizeMerge(uploadId: string, validatedBody: any, user: any) {
    //  Get Metadata
    const metadata = await StorageService.getMetadata(uploadId);
    const extension = path.extname(metadata.originalFilename).toLowerCase();
    const finalFilename = `${uploadId}${extension}`;

    //  Physical Merge ( memory-leak safe)
    const finalPath = await StorageService.mergeChunks(
      uploadId,
      metadata.totalChunks,
      finalFilename,
    );

    const stats = await fs.stat(finalPath);

    //  Database Update
    const asset = await AssetModel.findOneAndUpdate(
      { uploadId: uploadId },
      {
        uploadId: uploadId,
        title: validatedBody.title || metadata.originalFilename,
        fileType: extension.match(/\.(mp4|webm|mov)$/) ? 'video' : 'image',
        localPath: finalPath,
        ownerID: user.userID,
        ownerEmail: user.userEmail,
        department: validatedBody.department,
        status: 'pending',
        metadata: { extension: extension.replace('.', ''), size: stats.size },
      },
      { upsert: true, new: true },
    );

    //  Handle Collections
    if (validatedBody.collectionId) {
      await CollectionModel.findByIdAndUpdate(validatedBody.collectionId, {
        $addToSet: { assets: asset._id },
      });
    }

    //  Trigger Worker with basic error handling
    try {
      await publishToQueue('asset_upload_processing', {
        assetId: asset._id,
        filePath: finalPath,
        fileType: asset.fileType,
      });
    } catch (error) {
      console.error(`Failed to queue asset ${asset._id}:`, error);
      //Mark asset as 'failed' or 'retry_required' in DB
      await AssetModel.findByIdAndUpdate(asset._id, { status: 'error' });
      throw new Error('Merge successful but failed to trigger processing worker.');
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
