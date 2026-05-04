import amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

import { AssetModel } from '../models/asset.model.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';
const QUEUE_NAME = 'asset_upload_processing';
const THUMBNAIL_DIR = path.resolve('storage/thumbnails');

let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

/**
 * Queue payload type
 */
interface MediaTaskPayload {
  assetId: string;
  filePath: string;
  fileType: string;
}

/**
 * Process single queue task
 */
async function handleTask(channel: Channel, msg: ConsumeMessage): Promise<void> {
  let assetId: string | undefined;

  try {
    /**
     * Parse queue message
     */
    const payload: MediaTaskPayload = JSON.parse(msg.content.toString()) as MediaTaskPayload;
    const { filePath, fileType } = payload;
    assetId = payload.assetId;

    /**
     * Validate payload
     */
    if (!assetId || !filePath) {
      throw new Error('Invalid queue payload');
    }

    console.log(` Processing asset: ${assetId}`);

    /**
     * Mark asset as processing
     */
    await AssetModel.findByIdAndUpdate(assetId, {
      status: 'processing',
    });

    /**
     * Ensure file exists
     */
    await fs.access(filePath);

    let thumbnailPath: string | undefined;

    /**
     * Generate thumbnail for images
     */
    if (fileType === 'image') {
      const thumbnailName = `thumb-${Date.now()}-${assetId}.webp`;
      const absoluteThumbnailPath = path.join(THUMBNAIL_DIR, thumbnailName);
      thumbnailPath = path.posix.join('storage/thumbnails', thumbnailName);

      await sharp(filePath)
        .resize(300, 300, {
          fit: 'cover',
        })
        .webp({
          quality: 80,
        })
        .toFile(absoluteThumbnailPath);

      console.log(` Thumbnail created: ${thumbnailName}`);
    }

    /**
     * Read file stats
     */
    const stats = await fs.stat(filePath);

    /**
     * Update asset success state
     */
    await AssetModel.findByIdAndUpdate(assetId, {
      status: 'uploaded',
      thumbnailPath,
      'metadata.size': stats.size,
      'metadata.processedAt': new Date(),
    });

    /**
     * Acknowledge success
     */
    channel.ack(msg);

    console.log(` Asset uploaded: ${assetId}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown worker error';

    console.error(` Worker Task Error: ${message}`);

    /**
     * Mark failed in database
     */
    if (assetId) {
      await AssetModel.findByIdAndUpdate(assetId, {
        status: 'failed',
      }).catch(() => {
        console.error(` Failed updating asset status: ${assetId}`);
      });
    }

    /**
     * Reject message without requeue
     */
    channel.nack(msg, false, false);
  }
}

/**
 * Start media worker
 */
export async function processMedia(): Promise<void> {
  try {
    /**
     * RabbitMQ connection
     */
    const connection: ChannelModel = await amqp.connect(RABBITMQ_URL);

    /**
     * RabbitMQ channel
     */
    const channel: Channel = await connection.createChannel();

    /**
     * Reset retry count after successful connect
     */
    retryCount = 0;

    /**
     * Ensure queue exists
     */
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });

    /**
     * Process one message at a time
     */
    await channel.prefetch(1);

    /**
     * Ensure thumbnail directory exists
     */
    await fs.mkdir(THUMBNAIL_DIR, {
      recursive: true,
    });

    console.log(` Media Worker connected to "${QUEUE_NAME}"`);

    /**
     * Handle RabbitMQ close event
     */
    connection.on('close', () => {
      console.warn(' RabbitMQ connection closed');

      attemptReconnect();
    });

    /**
     * Handle RabbitMQ errors
     */
    connection.on('error', (err: Error) => {
      console.error(` RabbitMQ Error: ${err.message}`);
    });

    /**
     * Start consuming messages
     */
    await channel.consume(
      QUEUE_NAME,
      async (msg: ConsumeMessage | null) => {
        if (!msg) {
          return;
        }

        await handleTask(channel, msg);
      },
      {
        noAck: false,
      },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'RabbitMQ connection failed';

    console.error(` Worker Connection Failed: ${message}`);

    attemptReconnect();
  }
}

/**
 * Retry reconnect logic
 */
function attemptReconnect(): void {
  if (retryCount >= MAX_RETRIES) {
    console.error(' Max RabbitMQ retries reached. Worker stopped.');

    return;
  }

  retryCount++;

  console.log(`Retry ${retryCount}/${MAX_RETRIES} in ${RETRY_DELAY / 1000} seconds...`);

  setTimeout(() => {
    void processMedia();
  }, RETRY_DELAY);
}
