import amqp from 'amqplib';
import { AssetModel } from '../../models/asset.model.js';
import { handleGlobalError } from '../../utils/globleError.js';
import { logger } from '../../utils/logger.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';

/**
 * Worker to process expired assets from RabbitMQ.
 */
export const consumeExpiration = async (): Promise<void> => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Ensure queue exists and survives server restarts
    await channel.assertQueue(
      process.env.QUEUE_EXPIRATION_ASSET_NAME || 'asset_expiration_worker',
      { durable: true },
    );

    channel.consume(
      process.env.QUEUE_EXPIRATION_ASSET_NAME || 'asset_expiration_worker',
      async (msg) => {
        try {
          if (!msg) {
            return;
          }

          const { assetId } = JSON.parse(msg.content.toString());
          const asset = await AssetModel.findById(assetId);

          if (asset) {
            // Perform soft delete by flagging expiration status
            await AssetModel.findByIdAndUpdate(assetId, {
              expiresAt: new Date(),
              isExpired: true,
            });
          }

          // Acknowledge successful processing to remove from queue
          channel.ack(msg);
          logger.info('[QUEUE PROCESS ]: Asset expiration queue !', assetId);
        } catch (innerError) {
          // Prevent worker crash on message processing failure
          handleGlobalError(innerError);
        }
      },
    );
  } catch (error: unknown) {
    // Handle connection or channel setup failures
    handleGlobalError(error);
  }
};
