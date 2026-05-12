// this handleAssetTask will recive channel name and message as { assetId, filePath, fileType } and create thumbnails for images using helper function generateThumbnail :
// work :  1)update document db data, 2)generateThumbnail, 3) save thumbnail

import { Channel, ConsumeMessage } from 'amqplib';
import path from 'path';
import fs from 'fs/promises';
import { AssetModel } from '../../models/asset.model.js';
import { MediaTaskPayload } from '../../types/index.js';
import { generateThumbnail } from '../../helper/imageThumbnail.helper.js';
import { getFileHash } from '../../helper/duplicateAsset.helper.js';

// path for thumbnails
const THUMBNAIL_DIR = path.resolve(process.env.RABBITMQ_THUMBNAILPATH || 'storage/thumbnails');
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.tiff'];

// Handle a single asset processing task from the queue
export async function handleAssetTask(channel: Channel, msg: ConsumeMessage): Promise<void> {
  const payload: MediaTaskPayload = JSON.parse(msg.content.toString());
  const { assetId, filePath, fileType } = payload;

  try {
    await fs.access(filePath);

    // Generate hash
    const currentFileHash = await getFileHash(filePath);

    // Check for an existing processed duplicate
    const duplicate = await AssetModel.findOne({
      fileHash: currentFileHash,
      status: 'uploaded',
      _id: { $ne: assetId },
    });

    if (duplicate) {
      // Re-use the existing thumbnail and metadata
      await AssetModel.findByIdAndUpdate(assetId, {
        status: 'uploaded',
        fileHash: currentFileHash,
        thumbnailPath: duplicate.thumbnailPath, // Use the actual file path from the original
        'metadata.size': duplicate.metadata.size,
        'metadata.isDuplicate': true,
        'metadata.originalAssetId': duplicate._id,
      });

      // await fs.unlink(filePath);

      return channel.ack(msg);
    }

    // Update status to processing and save the hash
    await AssetModel.findByIdAndUpdate(assetId, {
      status: 'processing',
      fileHash: currentFileHash,
    });

    let thumbnailPath: string | undefined;

    if (fileType === 'image') {
      const thumbnailName = `thumb-${Date.now()}-${assetId}.webp`;
      const absolutePath = path.join(THUMBNAIL_DIR, thumbnailName);

      // Store relative path for DB
      thumbnailPath = path.posix.join(
        process.env.RABBITMQ_THUMBNAILPATH || 'storage/thumbnails',
        thumbnailName,
      );

      const ext = path.extname(filePath).toLowerCase();
      if (!SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
        await AssetModel.findByIdAndUpdate(assetId, { status: 'uploaded' });
        return channel.ack(msg);
      }

      await generateThumbnail(filePath, absolutePath);
    }

    // Final Save
    const stats = await fs.stat(filePath);
    await AssetModel.findByIdAndUpdate(assetId, {
      status: 'uploaded',
      thumbnailPath,
      'metadata.size': stats.size,
      'metadata.processedAt': new Date(),
    });

    channel.ack(msg);
  } catch (err) {
    if (assetId) {
      await AssetModel.findByIdAndUpdate(assetId, { status: 'failed' });
    }
    channel.nack(msg, false, false);
    throw err;
  }
}
