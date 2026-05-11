import fs from 'fs/promises';
import path from 'path';
import { AssetModel } from '../models/asset.model.js';
import { handleGlobalError } from '../utils/globleError.js';

/**
 * Iteratively deletes provided file paths from the physical storage disk.
 */
export const removePhysicalFiles = async (filePaths: (string | undefined)[]): Promise<void> => {
  for (const filePath of filePaths) {
    if (!filePath) {
      continue;
    }

    const absolutePath = path.resolve(filePath);
    // Verify file accessibility before attempting deletion
    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
  }
};

/**
 * Reassigns the "Original" status to the next available duplicate when a primary asset is removed.
 */
export async function transferOriginalStatus(hash: string, oldOriginalId: string): Promise<void> {
  try {
    // Identify the first candidate to be promoted from duplicate to original
    const newOriginal = await AssetModel.findOne({
      fileHash: hash,
      _id: { $ne: oldOriginalId },
    });

    if (newOriginal) {
      // Clear duplicate flags and remove references to the deleted original
      await AssetModel.findByIdAndUpdate(newOriginal._id, {
        isDuplicate: false,
        $unset: { originalAssetId: '', 'metadata.originalAssetId': '' },
        'metadata.isDuplicate': false,
      });

      // Redirect all remaining duplicates to point to the newly promoted original asset
      await AssetModel.updateMany(
        { fileHash: hash, _id: { $ne: newOriginal._id } },
        {
          originalAssetId: newOriginal._id,
          'metadata.originalAssetId': newOriginal._id,
        },
      );
    }
  } catch (error: unknown) {
    handleGlobalError(error);
  }
}
