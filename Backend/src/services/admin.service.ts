// All admin services flow to serve admin request from there route
import { AssetModel } from '../models/asset.model.js';
import { CollectionModel } from '../models/collection.model.js';
import { publishToQueue } from '../helper/producer.js';
import fs from 'fs/promises';
import path from 'path';
import { ChunkUploadBody, FinalizeMergeBody, IAsset } from '../types/index.js';
import {
  getFileSesionDetails,
  mergeFinalChunks,
  saveChunkBasedChunkId,
  saveFileSesionDetails,
} from '../helper/fileHandlers.js';
import { getFileHash } from '../helper/duplicate.js';
import { publishToExpirationQueue } from '../helper/expireAsset.js';

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
  //get chart data
  async getChartDataService() {
    //  Run Aggregation
    const data = await AssetModel.aggregate([
      {
        $match: {
          status: 'uploaded',
        },
      },
      {
        $group: {
          _id: {
            // formate time
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        // Sort by date ascending
        $sort: { _id: 1 },
      },
    ]);

    //  split the data into two arrays for the X and Y axes
    const labels = data.map((item) => item._id);
    const counts = data.map((item) => item.count);

    return {
      date: labels,
      count: counts,
    };
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
  async finalizeMerge(
    uploadId: string,
    validatedBody: FinalizeMergeBody,
    user: { userID: string; userRole: string },
  ) {
    // Retrieve session metadata and prepare file paths
    const sessionMetadata = await getFileSesionDetails(uploadId);
    const extension = path.extname(sessionMetadata.originalFilename).toLowerCase();
    const finalFilename = `${uploadId}${extension}`;

    // Perform the physical merge and generate a hash for duplicate checking
    const finalPath = await mergeFinalChunks(uploadId, sessionMetadata.totalChunks, finalFilename);
    const currentFileHash = await getFileHash(finalPath);
    const stats = await fs.stat(finalPath);

    //Check for an existing processed duplicate in the database
    const existingAsset = await AssetModel.findOne({
      fileHash: currentFileHash,
      status: 'uploaded',
    });

    const isVideo = /\.(mp4|webm|mov)$/i.test(extension);
    const isDuplicate = !!existingAsset;

    // Construct the update payload
    // We use spread operators to conditionally include duplicate-specific fields
    const updatePayload: Partial<IAsset> = {
      uploadId,
      fileHash: currentFileHash,
      title: validatedBody.title || sessionMetadata.originalFilename,
      fileType: (isVideo ? 'video' : 'image') as 'video' | 'image',
      localPath: finalPath,
      ownerID: user.userID,
      owner: user.userRole,
      department: validatedBody.department,
      status: isDuplicate ? 'uploaded' : 'pending',
      ...(isDuplicate && { thumbnailPath: existingAsset.thumbnailPath }),

      metadata: {
        extension: extension.replace('.', ''),
        size: stats.size,
        isDuplicate: isDuplicate,
        hash: currentFileHash,
        tags: [],
        dimensions: '',
        ...(isDuplicate && { originalAssetId: existingAsset._id.toString() }),
      },
    };

    // Update the Database (Upsert ensures the document is created if it doesn't exist)
    const assetData = await AssetModel.findOneAndUpdate({ uploadId }, updatePayload, {
      upsert: true,
      new: true,
    });

    if (!assetData) {
      throw new Error('Failed to create or update asset document');
    }

    // Associate with a collection if provided
    if (validatedBody.collectionId) {
      await CollectionModel.findByIdAndUpdate(validatedBody.collectionId, {
        $addToSet: { assets: assetData._id },
      });
    }

    // Queue Worker: ONLY publish if the file is unique
    if (!isDuplicate) {
      try {
        await publishToQueue({
          assetId: assetData._id.toString(),
          filePath: finalPath,
          fileType: assetData.fileType,
        });
      } catch (error: unknown) {
        // Rollback status to error if queueing fails
        await AssetModel.findByIdAndUpdate(assetData._id, { status: 'failed' });

        if (error instanceof Error) {
          throw new Error(`Merge successful, but processing queue failed: ${error.message}`);
        }
        throw new Error('Merge successful, but failed to trigger background worker');
      }
      try {
        // Schedule the expiration
        await publishToExpirationQueue(assetData._id.toString());
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error('publish to expiration not works');
        }
      }
    }

    return assetData;
  }
}

export const adminServices = new AdminServices();
