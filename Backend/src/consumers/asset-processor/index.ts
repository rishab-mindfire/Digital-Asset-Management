import amqp from 'amqplib';
import { handleAssetTask } from './handleAssetTask.js';
import { RABBITMQ_CONFIG } from '../../config/rabbitmq.config.js';
import { handleGlobalError } from '../../utils/globleError.js';
import { logger } from '../../utils/logger.js';

/**
 * Initializes and starts the background worker for asset processing.
 */
export async function startAssetWorker(): Promise<void> {
  try {
    const connection = await amqp.connect(RABBITMQ_CONFIG.URL);
    const channel = await connection.createChannel();

    // Ensure persistent queue and limit concurrent processing to one task
    await channel.assertQueue(RABBITMQ_CONFIG.QUEUES.QUEUE_NAME, { durable: true });
    await channel.prefetch(1);

    // Subscribe to queue and delegate message handling
    channel.consume(RABBITMQ_CONFIG.QUEUES.QUEUE_NAME, (msg) => {
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
