import amqp from 'amqplib';
import { logger } from '../utils/logger.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';
const FINAL_EXPIRY_QUEUE = process.env.QUEUE_EXPIRATION_ASSET_NAME || 'asset_expiration_worker';

export const publishToExpirationQueue = async (assetId: string): Promise<void> => {
  let connection;
  const DELAY_QUEUE = 'asset_expiry_delay';
  const EXPIRY_EXCHANGE = 'asset_expiry_exchange';
  const ROUTING_KEY = 'expire_key';

  // Calculate TTL: 10 days = 864,000,000 ms
  const days = Number(process.env.EXPIRY_DAYS || 10);
  const expiredInMs = days * 24 * 60 * 60 * 1000;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Setup the Exchange for expired messages
    await channel.assertExchange(EXPIRY_EXCHANGE, 'direct', { durable: true });

    // Setup the Worker Queue where messages land after 10 days
    await channel.assertQueue(FINAL_EXPIRY_QUEUE, { durable: true });
    await channel.bindQueue(FINAL_EXPIRY_QUEUE, EXPIRY_EXCHANGE, ROUTING_KEY);

    //  Setup the Delay Queue
    await channel.assertQueue(DELAY_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': EXPIRY_EXCHANGE,
        'x-dead-letter-routing-key': ROUTING_KEY,
        'x-queue-mode': 'lazy',
      },
    });

    const payload = Buffer.from(JSON.stringify({ assetId, createdAt: new Date() }));

    //  Set the days expiration on the MESSAGE itself
    channel.sendToQueue(DELAY_QUEUE, payload, {
      persistent: true,
      expiration: expiredInMs.toString(),
    });

    logger.info(`Asset ${assetId} queued. Will expire in ${days} days.`);

    await channel.close();
    await connection.close();
  } catch (error) {
    logger.error(`Failed to queue expiration: ${error}`);
    if (connection) {
      await connection.close();
    }
    throw error;
  }
};
