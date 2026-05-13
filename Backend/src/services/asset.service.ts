import { FilterQuery } from 'mongoose';
import { AssetModel } from '../models/asset.model.js';
import { UsageTrackingModel } from '../models/usagetracking.model.js';
import { AuthUser, IAsset } from '../types/index.js';
import { removePhysicalFiles, transferOriginalStatus } from '../helper/removeFiles.helper.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import { Response } from 'express';
import path from 'path';
import { getMimeType } from '../helper/fileMimeType.helper.js';
import { handleControllerError } from '../utils/globleError.js';

class AssetManagement {
  // ALL asset lists
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
    const assets = await AssetModel.find(filter, {
      metadata: 0,
      ownerID: 0,
      uploadId: 0,
      localPath: 0,
      isExpired: false,
    })
      .sort({ updatedAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await AssetModel.countDocuments(filter);
    const totalNumberOfAssets = await AssetModel.countDocuments();
    return {
      assets,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalNumberOfAssets: search ? total : totalNumberOfAssets,
    };
  }

  // Asset details
  async getAssetFullDetail(assetId: string, user: AuthUser) {
    const asset = await AssetModel.findById(assetId);
    if (!asset) {
      return null;
    }

    // Log usage
    UsageTrackingModel.create({
      assetId,
      performerId: user.userID,
      performerEmail: user.userEmail,
      action: 'view',
    }).catch((err) => logger.error('Tracking Error:', err));

    const history = await UsageTrackingModel.find({ assetId }).sort({ createdAt: -1 }).limit(10);

    return { asset, history };
  }

  // mark markApprove
  async markApprove(assetId: string) {
    return await AssetModel.findByIdAndUpdate(assetId, { approval: 'approved' });
  }

  // get meteData
  async getAssetMetadata(assetId: string) {
    const asset = await AssetModel.findById(assetId, {
      title: 1,
      owner: 1,
      fileType: 1,
      approval: 1,
      metadata: 1,
    });
    if (!asset) {
      return null;
    }
    return asset;
  }

  // delet assets
  deleteAssetService = async (assetId: string) => {
    const asset = await AssetModel.findById(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    //  Database Cleanup (Collections)
    await AssetModel.updateMany({ assets: assetId }, { $pull: { assets: assetId } });

    // Reference Counting
    const sharingCount = await AssetModel.countDocuments({
      fileHash: asset.fileHash,
      _id: { $ne: assetId },
    });

    //  Conditional Deletion Logic
    if (sharingCount === 0) {
      await removePhysicalFiles([asset.localPath, asset.thumbnailPath, asset.previewPath]);
    } else if (!asset.isDuplicate) {
      await transferOriginalStatus(asset.fileHash, assetId);
    }

    // Final DB Removal
    await AssetModel.findByIdAndDelete(assetId);

    return { success: true };
  };

  // download assets
  /**
   * Streams an asset from the local filesystem to the client.
   * Handles dynamic content types and filenames.
   */

  getAssetForDownload = async (assetId: string, res: Response) => {
    try {
      // Fetch Asset from DB
      const asset = await AssetModel.findById(assetId);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }

      const absolutePath = path.resolve(asset.localPath);
      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ message: 'Physical file missing' });
      }

      //  Resolve Filename & Extension
      const metadataExt = asset.metadata?.extension || '';
      const dotExt = metadataExt.startsWith('.') ? metadataExt : `.${metadataExt}`;

      let finalFileName = asset.title;
      if (!finalFileName.toLowerCase().endsWith(dotExt.toLowerCase())) {
        finalFileName = `${finalFileName}${dotExt}`;
      }

      //  Dynamic MIME Type
      const mimeType = getMimeType(finalFileName);

      //  Encode for Header Safety
      const encodedName = encodeURIComponent(finalFileName);

      // Set Headers
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', asset.metadata?.size || 0);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
      );

      // Stream the file
      const readStream = fs.createReadStream(absolutePath);

      readStream.on('error', (error) => {
        logger.error('Streaming error:', error);
        if (!res.headersSent) {
          res.status(500).send('Streaming failed');
        }
      });

      readStream.pipe(res);
    } catch (error) {
      handleControllerError(res, error, 'Internal Server Error', 500);
      // console.error('Download Service Error:', error);
      // if (!res.headersSent) {
      //   res.status(500).json({ message: 'Internal Server Error' });
      // }
    }
  };
}

export const assetService = new AssetManagement();
