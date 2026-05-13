import amqp from 'amqplib';
import { logger } from '../utils/logger.js';

// Rabit mq url
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';
const queueName = process.env.QUEUE_EXPIRATION_ASSET_NAME || '';

export const publishToQueueForThumbnail = async (data: Record<string, unknown>): Promise<void> => {
  let connection;
  try {
    // Establish connection and Create a channel
    connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Ensure the queue exists
    await channel.assertQueue(queueName, { durable: true });

    //  Send the message
    //  true ensures the message survives RabbitMQ restarts
    const messageBuffer = Buffer.from(JSON.stringify(data));
    channel.sendToQueue(queueName, messageBuffer, {
      persistent: true,
    });

    if (messageBuffer) {
      logger.info('[Queue Success] Task sent for Asset  :', data.assetId);
    }

    // Clean up
    await channel.close();
    await connection.close();
  } catch (error: unknown) {
    // Check if it's a connection error
    if (error instanceof Error) {
      throw error;
    }
  }
};
