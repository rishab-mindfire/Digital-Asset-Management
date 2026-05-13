import amqp from 'amqplib';
import { logger } from '../utils/logger.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';
const FINAL_EXPIRY_QUEUE = process.env.QUEUE_EXPIRATION_ASSET_NAME || 'asset_expiration_worker';

export const publishToExpirationQueue = async (assetId: string): Promise<void> => {
  let connection;
  const DELAY_QUEUE = 'asset_expiry_delay';
  const EXPIRY_EXCHANGE = 'asset_expiry_exchange';
  const ROUTING_KEY = 'expire_key';

  // Convert days to milliseconds
  const expiredIn = Number(process.env.EXPIRY_DAYS || 10) * 24 * 60 * 60 * 1000;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Setup the Exchange that will receive messages AFTER they expire
    await channel.assertExchange(EXPIRY_EXCHANGE, 'direct', { durable: true });

    //  Setup the Worker Queue
    await channel.assertQueue(FINAL_EXPIRY_QUEUE, { durable: true });
    await channel.bindQueue(FINAL_EXPIRY_QUEUE, EXPIRY_EXCHANGE, ROUTING_KEY);

    //  Setup the Delay Queue
    //  queue send expired messages to EXPIRY_EXCHANGE
    await channel.assertQueue(DELAY_QUEUE, {
      durable: true,
      arguments: {
        'x-message-ttl': expiredIn,
        'x-dead-letter-exchange': EXPIRY_EXCHANGE,
        'x-dead-letter-routing-key': ROUTING_KEY,
        'x-queue-mode': 'lazy', // Good for long-term storage of many messages
      },
    });

    //  Publish the message to the DELAY queue
    const payload = Buffer.from(JSON.stringify({ assetId, createdAt: new Date() }));
    channel.sendToQueue(DELAY_QUEUE, payload, { persistent: true });
    logger.info(`Asset ${assetId} queued for expiration in ${process.env.EXPIRY_DAYS || 10} days.`);

    await channel.close();
    await connection.close();
  } catch (error) {
    logger.error('Failed to queue expiration:', error);
    // Ensure connections are closed even on failure if they were opened
    if (connection) {
      await connection.close();
    }
  }
};
