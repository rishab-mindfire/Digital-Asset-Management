import amqp from 'amqplib';
import { handleAssetTask } from './handleAssetTask.js';
import { handleGlobalError } from '../../utils/globleError.js';
import { logger } from '../../utils/logger.js';

/**
 * Initializes and starts the background worker for asset processing.
 */
export async function startAssetWorker(): Promise<void> {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || '');
    const channel = await connection.createChannel();

    // Ensure persistent queue and limit concurrent processing to one task
    await channel.assertQueue(process.env.QUEUE_UPLOAD_ASSET_NAME || '', { durable: true });
    await channel.prefetch(1);

    // Subscribe to queue and delegate message handling
    channel.consume(process.env.QUEUE_UPLOAD_ASSET_NAME || '', (msg) => {
      if (msg) {
        handleAssetTask(channel, msg);
        logger.info('[QUEUE PROCESS ]: Asset queue !', msg);
      }
    });
  } catch (error: unknown) {
    // Handle startup or connection failures
    handleGlobalError(error);
  }
}
