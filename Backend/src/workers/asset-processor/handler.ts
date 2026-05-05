import { Channel, ConsumeMessage } from 'amqplib';
import path from 'path';
import fs from 'fs/promises';

import { AssetModel } from '../../models/asset.model.js';
import { MediaTaskPayload } from '../../types/index.js';
import { MediaService } from '../../services/media.service.js';

// Centralized path for thumbnails
const THUMBNAIL_DIR = path.resolve('storage/thumbnails');

/**
 * Handle a single asset processing task from the queue
 */
export async function handleAssetTask(channel: Channel, msg: ConsumeMessage): Promise<void> {
  let assetId: string | undefined;

  try {
    /**
     * Parse and Validate Payload
     */
    const payload: MediaTaskPayload = JSON.parse(msg.content.toString());
    const { filePath, fileType } = payload;
    assetId = payload.assetId;

    if (!assetId || !filePath) {
      throw new Error('Invalid queue payload: Missing assetId or filePath');
    }

    // console.log(`[Worker] Starting process for Asset: ${assetId}`);

    /**
     * Mark Asset as Processing in DB
     */
    await AssetModel.findByIdAndUpdate(assetId, { status: 'processing' });

    /**
     * Pre-flight Check: Ensure source file exists
     */
    await fs.access(filePath);

    let thumbnailPath: string | undefined;

    /**
     *  Media Processing Logic
     * We delegate the actual image manipulation to the MediaService
     */
    if (fileType === 'image') {
      // Ensure the directory exists
      await fs.mkdir(THUMBNAIL_DIR, { recursive: true });

      const thumbnailName = `thumb-${Date.now()}-${assetId}.webp`;
      const absoluteThumbnailPath = path.join(THUMBNAIL_DIR, thumbnailName);

      // Relative path for database/frontend consumption
      thumbnailPath = path.posix.join('storage/thumbnails', thumbnailName);

      await MediaService.generateThumbnail(filePath, absoluteThumbnailPath);

      //console.log(`[Worker] Thumbnail generated: ${thumbnailName}`);
    } else if (fileType === 'video') {
      // Add VideoService.generateFrame()
      //console.log('[Worker] Video processing skipped (Logic not implemented)');
    }

    /**
     * Finalize Database State
     */
    const stats = await fs.stat(filePath);

    await AssetModel.findByIdAndUpdate(assetId, {
      status: 'uploaded',
      thumbnailPath,
      'metadata.size': stats.size,
      'metadata.processedAt': new Date(),
    });

    /**
     * Acknowledge Success
     * Removes the message from the queue
     */
    channel.ack(msg);
    //console.log(`[Worker] Asset ${assetId} completed successfully.`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown worker error';
    //console.error(`[Worker Error]: ${errorMessage}`);

    /**
     * Handle Failures
     */
    if (assetId) {
      await AssetModel.findByIdAndUpdate(assetId, { status: 'failed' }).catch((dbErr) =>
        console.error(`[Critical] Could not update failure status: ${dbErr.message}`),
      );
    }

    /**
     * Negative Acknowledge (Nack)
     * Requeue: false ( don't loop forever on a broken file)
     */
    channel.nack(msg, false, false);
  }
}
