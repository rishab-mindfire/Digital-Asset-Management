import { FilterQuery } from 'mongoose';
import { AssetModel } from '../models/asset.model.js';
import { promises as fsPromises } from 'fs';
import { UsageTrackingModel } from '../models/usagetracking.model.js';
import { AuthUser, FileMetadata, IAsset } from '../types/index.js';

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
    })
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

  // Single Asset details
  async getAssetFullDetail(assetId: string, user: AuthUser) {
    const asset = await AssetModel.findById(assetId);

    if (!asset) {
      return null;
    }
    // Fire-and-forget tracking
    void UsageTrackingModel.create({
      assetId: asset._id,
      performerId: user.userID,
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

  // Archive asset
  async removeAsset(assetId: string) {
    return await AssetModel.findByIdAndUpdate(assetId, { status: 'archived' }, { new: true });
  }

  // get file metadata details
  async getFileMetadata(localPath: string): Promise<FileMetadata> {
    const stat = await fsPromises.stat(localPath);
    return { size: stat.size, localPath };
  }
}

export const assetService = new AssetManagement();
