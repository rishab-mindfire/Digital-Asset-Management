//All admin services flow to serve admin request from there route

import { AssetModel } from '../models/asset.model.js';
import { CollectionModel } from '../models/collection.model.js';
import { publishToQueue } from '../helper/producer.js';
import fs from 'fs/promises';
import { createReadStream, promises as fsPromises } from 'fs';
import type { ReadStream } from 'fs';
import path from 'path';
import { UsageTrackingModel } from '../models/usagetracking.model.js';
import mongoose from 'mongoose';
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
  async uploadChunk(
    chunk: Express.Multer.File,
    chunkIndexStr: string,
    uploadId: string,
    totalChunksStr: string,
  ) {
    const chunkIndex = parseInt(chunkIndexStr, 10);
    const totalChunks = parseInt(totalChunksStr, 10);

    if (chunkIndex > totalChunks || chunkIndex < 1) {
      throw new Error(`Security Exception: Invalid chunkIndex ${chunkIndex}`);
    }

    const chunkDir = path.join(TEMP_DIR, uploadId);
    await fs.mkdir(chunkDir, { recursive: true });

    if (chunkIndex === 1) {
      const metadataPath = path.join(chunkDir, 'session-metadata.json');
      await fs.writeFile(
        metadataPath,
        JSON.stringify({
          originalFilename: chunk.originalname,
          totalChunks,
          createdAt: new Date(),
        }),
        'utf8',
      );
    }

    const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);

    try {
      await fs.access(chunkPath);
    } catch {
      await fs.writeFile(chunkPath, chunk.buffer);
    }

    const existingFiles = await fs.readdir(chunkDir);
    const savedChunksCount = existingFiles.filter((file) => file.startsWith('chunk-')).length;
    const uploadProgress = Math.min(Math.round((savedChunksCount / totalChunks) * 100), 100);

    return {
      message: `Chunk ${chunkIndex} saved successfully.`,
      chunkIndex,
      totalChunks,
      progress: uploadProgress,
    };
  }
  // merge chun Asset
  async mergeChunks(
    uploadId: string,
    validatedBody: any,
    user: { userID: string; userEmail: string },
  ) {
    const chunkDir = path.join(TEMP_DIR, uploadId);
    const metadataPath = path.join(chunkDir, 'session-metadata.json');

    //  Check if the temp upload directory exists
    await fs.access(chunkDir).catch(() => {
      throw new Error(`Merge failed: Temp session '${uploadId}' does not exist.`);
    });

    let originalFilename: string;
    let totalChunks: number;

    // Safely read metadata
    try {
      const metaData = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      originalFilename = metaData.originalFilename;
      totalChunks = metaData.totalChunks;
    } catch {
      throw new Error('Merge blocked: Session metadata file is corrupted or missing.');
    }

    // Setup permanent path
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const extension = path.extname(originalFilename).toLowerCase();
    const finalFilename = `${uploadId}${extension}`;
    const finalPath = path.join(UPLOAD_DIR, finalFilename);

    // Ensure the final file exists
    try {
      await fs.access(finalPath);
    } catch {
      await fs.writeFile(finalPath, ''); // Create empty file if not present
    }

    // Append available chunks
    for (let i = 1; i <= totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk-${i}`);

      try {
        await fs.access(chunkPath);
        const chunkBuffer = await fs.readFile(chunkPath);
        await fs.appendFile(finalPath, chunkBuffer);
        await fs.unlink(chunkPath); // Delete only the specific chunk file
      } catch {
        // Skip if chunk was already merged
        continue;
      }
    }

    // Check if more chunks are expected in the future
    const remainingFiles = await fs.readdir(chunkDir);
    const remainingChunks = remainingFiles.filter((file) => file.startsWith('chunk-'));

    // If NO chunks are left in temp, the file is fully merged. WIPE the temp folder.
    if (remainingChunks.length === 0) {
      await fs.rm(chunkDir, { recursive: true, force: true });
    } else {
      // There are still chunks coming (e.g. 11, 12). Keep metadata intact!
      console.log(`Partial merge complete for ${uploadId}. Keeping metadata file.`);
    }

    //  DB updates & Queue publishing
    const stats = await fs.stat(finalPath);
    const asset = await AssetModel.findOneAndUpdate(
      { localPath: finalPath },
      {
        title: validatedBody.title || originalFilename,
        fileType: extension.match(/\.(mp4|webm|mov)$/) ? 'video' : 'image',
        localPath: finalPath,
        ownerID: user.userID,
        ownerEmail: user.userEmail,
        department: validatedBody.department,
        expiryDate: validatedBody.expiryDate,
        status: 'pending',
        metadata: { extension: extension.replace('.', ''), size: stats.size },
      },
      { upsert: true, new: true },
    );

    if (validatedBody.collectionId && this.isValidId(validatedBody.collectionId)) {
      await CollectionModel.findByIdAndUpdate(validatedBody.collectionId, {
        $addToSet: { assets: asset._id },
      });
    }

    await publishToQueue('asset_upload_processing', {
      assetId: asset._id,
      filePath: finalPath,
      fileType: asset.fileType,
    });

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
