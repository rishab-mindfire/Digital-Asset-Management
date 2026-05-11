import fs from 'fs/promises';
import path from 'path';
import { AssetModel } from '../models/asset.model.js';

export const removePhysicalFiles = async (filePaths: (string | undefined)[]) => {
  for (const filePath of filePaths) {
    if (!filePath) {
      continue;
    } // Skip empty paths

    try {
      const absolutePath = path.resolve(filePath);
      await fs.access(absolutePath); // Check if exists before unlinking
      await fs.unlink(absolutePath);
    } catch (err) {
      console.error(`Cleanup failed for ${filePath}:`, err);
    }
  }
};

export async function transferOriginalStatus(hash: string, oldOriginalId: string) {
  // Find the first duplicate in line
  const newOriginal = await AssetModel.findOne({
    fileHash: hash,
    _id: { $ne: oldOriginalId },
  });

  if (newOriginal) {
    // 1. Promote the duplicate to an Original
    await AssetModel.findByIdAndUpdate(newOriginal._id, {
      isDuplicate: false,
      $unset: { originalAssetId: '', 'metadata.originalAssetId': '' },
      'metadata.isDuplicate': false,
    });

    // 2. Update all remaining duplicates to point to the new Original
    await AssetModel.updateMany(
      { fileHash: hash, _id: { $ne: newOriginal._id } },
      {
        originalAssetId: newOriginal._id,
        'metadata.originalAssetId': newOriginal._id,
      },
    );
  }
}
