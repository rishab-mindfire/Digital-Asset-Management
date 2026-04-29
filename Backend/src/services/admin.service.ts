import { AssetModel } from '../models/asset.model.js';
import { CollectionModel } from '../models/collection.model.js';
import { publishToQueue } from '../helper/producer.js';
import { determineFileType } from '../helper/filemetadata.js';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './storage/raw';

class AdminServices {
  async uploadAsset(
    files: Express.Multer.File[],
    validatedBody: any,
    user: { userID: string; userEmail: string },
  ): Promise<any[]> {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      // Process all files in parallel
      const assetPromises = files.map(async (file) => {
        //  Generate unique filename and save path
        const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        const localPath = path.join(UPLOAD_DIR, uniqueFilename);

        // Write the buffer to the disk
        await fs.writeFile(localPath, file.buffer);

        //  Create the Database Record
        const asset = await AssetModel.create({
          title: validatedBody.title || file.originalname,
          fileType: determineFileType(file.mimetype),
          localPath: localPath,
          ownerID: user.userID,
          ownerEmail: user.userEmail,
          department: validatedBody.department,
          expiryDate: validatedBody.expiryDate,
          status: 'pending',
          metadata: {
            extension: file.originalname.split('.').pop()?.toLowerCase(),
            size: file.size,
          },
        });

        //  Link to Collection if provided
        if (validatedBody.collectionId) {
          await CollectionModel.findByIdAndUpdate(validatedBody.collectionId, {
            $addToSet: { assets: asset._id },
          });
        }

        //  Trigger Background Processing
        await publishToQueue('asset_upload_processing', {
          assetId: asset._id,
          filePath: localPath,
          fileType: asset.fileType,
        });

        return asset;
      });

      // Wait for all assets to be saved and queued
      return await Promise.all(assetPromises);
    } catch (err: any) {
      console.error('Admin Service Error:', err);
      throw err;
    }
  }
}

export const adminServices = new AdminServices();
