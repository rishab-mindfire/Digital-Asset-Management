import amqp from 'amqplib';
import mongoose from 'mongoose';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { AssetModel } from '../models/asset.model.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';
const QUEUE_NAME = 'asset_upload_processing';
const THUMBNAIL_DIR = './storage/thumbnails';

async function processMedia() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Crucial: Process one at a time to prevent CPU spikes
    channel.prefetch(1);

    // Ensure thumbnail directory exists
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });

    console.log('Media Worker is running...');

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) {
        return;
      }

      const { assetId, filePath, fileType } = JSON.parse(msg.content.toString());

      try {
        // 1. UPDATE LIFECYCLE: Moving to 'processing'
        await AssetModel.findByIdAndUpdate(assetId, { status: 'processing' });

        let thumbnailPath = '';

        // 2. TASK: Generate Thumbnail (if it's an image)
        if (fileType === 'image') {
          const thumbName = `thumb-${Date.now()}-${assetId}.webp`;
          thumbnailPath = path.join(THUMBNAIL_DIR, thumbName);

          await sharp(filePath)
            .resize(300, 300, { fit: 'cover' })
            .toFormat('webp')
            .toFile(thumbnailPath);

          console.log(`[Worker] Thumbnail created for ${assetId}`);
        }

        // 3. TASK: Extraction (Simulate metadata extraction)
        const stats = await fs.stat(filePath);

        // 4. UPDATE LIFECYCLE: Moving to 'approved' (Task Completed)
        await AssetModel.findByIdAndUpdate(assetId, {
          status: 'uploaded',
          thumbnailPath: thumbnailPath,
          'metadata.size': stats.size,
          'metadata.processedAt': new Date(),
        });

        console.log(`[Worker] Asset ${assetId} lifecycle completed.`);
        channel.ack(msg);
      } catch (err) {
        console.error(`[Worker Error] Asset ${assetId} failed:`, err);
        await AssetModel.findByIdAndUpdate(assetId, { status: 'failed' });
        // Don't requeue if the file is corrupted/missing
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error('Critical Worker Failure:', error);
  }
}

mongoose.connect(process.env.MONGO_URI!).then(() => processMedia());
