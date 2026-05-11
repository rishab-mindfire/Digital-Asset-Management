import amqp from 'amqplib';

// Rabit mq url
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';
//days to expire
const EXPIRY_DAYS = process.env.EXPIRY_DAYS || 10;

export const publishToExpirationQueue = async (assetId: string): Promise<void> => {
  let connection;
  const DELAY_QUEUE = 'asset_expiry_delay';
  const EXPIRY_EXCHANGE = 'asset_expiry_exchange';
  const FINAL_EXPIRY_QUEUE = 'asset_deletion_worker';

  const dataOfExpire = Number(EXPIRY_DAYS) * 24 * 60 * 60 * 1000;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Setup the "Dead Letter" logic
    // This exchange will receive the message once it expires
    await channel.assertExchange(EXPIRY_EXCHANGE, 'direct', { durable: true });
    await channel.assertQueue(FINAL_EXPIRY_QUEUE, { durable: true });
    await channel.bindQueue(FINAL_EXPIRY_QUEUE, EXPIRY_EXCHANGE, 'expire_key');

    // Setup the queue
    await channel.assertQueue(DELAY_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': EXPIRY_EXCHANGE,
        'x-dead-letter-routing-key': 'expire_key',
        'x-message-ttl': dataOfExpire, // Global TTL for this queue
      },
    });

    // 3. Publish the message
    const payload = Buffer.from(JSON.stringify({ assetId }));
    channel.sendToQueue(DELAY_QUEUE, payload, { persistent: true });

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Failed to queue expiration:', error);
  }
};
