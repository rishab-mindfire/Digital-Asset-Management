import { Channel, ConsumeMessage } from 'amqplib';
import path from 'path';
import fs from 'fs/promises';

import { AssetModel } from '../../models/asset.model.js';
import { MediaTaskPayload } from '../../types/index.js';
import { generateThumbnail } from '../../helper/imageThumbnail.js';

// Centralized path for thumbnails
const THUMBNAIL_DIR = path.resolve('storage/thumbnails');
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.tiff'];

// Handle a single asset processing task from the queue

export async function handleAssetTask(channel: Channel, msg: ConsumeMessage): Promise<void> {
  const payload: MediaTaskPayload = JSON.parse(msg.content.toString());
  const { assetId, filePath, fileType } = payload;

  try {
    //  Initial Update
    await AssetModel.findByIdAndUpdate(assetId, { status: 'processing' });

    //  Pre-flight
    await fs.access(filePath);
    let thumbnailPath: string | undefined;

    // Processing
    if (fileType === 'image') {
      const thumbnailName = `thumb-${Date.now()}-${assetId}.webp`;
      const absolutePath = path.join(THUMBNAIL_DIR, thumbnailName);
      thumbnailPath = path.posix.join('storage/thumbnails', thumbnailName);
      const ext = path.extname(filePath).toLowerCase();
      if (!SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
        // Update DB to skip thumbnail or mark as uploaded
        await AssetModel.findByIdAndUpdate(assetId, { status: 'uploaded' });
        return channel.ack(msg);
      }
      await generateThumbnail(filePath, absolutePath);
    }
    // Add video logic

    // Final Metadata Retrieval & Update
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
    // nack on corrupted files
    channel.nack(msg, false, false);
    throw err;
  }
}
