import amqp from 'amqplib';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { AssetModel } from '../models/asset.model.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';
const QUEUE_NAME = 'asset_upload_processing';
const THUMBNAIL_DIR = './storage/thumbnails';

export async function processMedia() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Ensure only 1 message is processed at a time per worker instance
    await channel.prefetch(1);

    // Ensure thumbnail directory exists
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });

    // Connection recovery / loggers
    connection.on('error', (err) => console.error('[RabbitMQ Worker] Connection error:', err));
    connection.on('close', () =>
      console.warn('[RabbitMQ Worker] Connection closed. Attempting reconnect...'),
    );

    console.log('Media Worker is running and listening for tasks...');

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) {
        return;
      }

      const payload = msg.content.toString();
      let assetId: string | undefined;
      let filePath: string | undefined;
      let fileType: string | undefined;

      try {
        const parsed = JSON.parse(payload);
        assetId = parsed.assetId;
        filePath = parsed.filePath;
        fileType = parsed.fileType;
      } catch (e) {
        console.error('[Worker] Failed to parse message JSON. Discarding invalid task.', payload);
        return channel.ack(msg); // Discard corrupted task formats completely
      }

      try {
        if (!assetId || !filePath) {
          throw new Error('Invalid message payload: missing assetId or filePath');
        }

        // 1. UPDATE LIFECYCLE: Moving to 'processing'
        await AssetModel.findByIdAndUpdate(assetId, { status: 'processing' });

        let thumbnailPath = '';

        // Check if raw source file actually exists on disk before processing
        try {
          await fs.access(filePath);
        } catch (err) {
          throw new Error(`File does not exist at path: ${filePath}`);
        }

        // 2. TASK: Generate Thumbnail (if it's an image)
        if (fileType === 'image') {
          const thumbName = `thumb-${Date.now()}-${assetId}.webp`;

          // Using forward slashes for cross-platform and web-serving consistency
          thumbnailPath = path.posix.join('storage/thumbnails', thumbName);
          const absoluteThumbPath = path.join(THUMBNAIL_DIR, thumbName);

          await sharp(filePath)
            .resize(300, 300, { fit: 'cover' })
            .toFormat('webp')
            .toFile(absoluteThumbPath);

          console.log(`[Worker] Thumbnail created for ${assetId}`);
        }

        // 3. TASK: Extraction
        const stats = await fs.stat(filePath);

        // 4. UPDATE LIFECYCLE: Move to 'uploaded' (Success)
        await AssetModel.findByIdAndUpdate(assetId, {
          status: 'uploaded',
          thumbnailPath: thumbnailPath || undefined,
          'metadata.size': stats.size,
          'metadata.processedAt': new Date(),
        });

        console.log(`[Worker] Asset ${assetId} processing successfully completed.`);
        channel.ack(msg);
      } catch (err: any) {
        console.error(
          `[Worker Error] Asset ${assetId} failed during processing:`,
          err.message || err,
        );

        if (assetId) {
          await AssetModel.findByIdAndUpdate(assetId, { status: 'failed' }).catch((dbErr) =>
            console.error('[Worker DB Panic] Failed to mark status as failed:', dbErr.message),
          );
        }

        // Drop task: do not requeue corrupted files or un-processable media
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error('Critical Worker Failure:', error);
    // Restart logic can be injected here or handled by process managers like PM2
  }
}
