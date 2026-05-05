import amqp from 'amqplib';
import { handleAssetTask } from './handler.js';
import { RABBITMQ_CONFIG } from '../../config/rabbitmq.config.js';

export async function startAssetWorker() {
  const connection = await amqp.connect(RABBITMQ_CONFIG.URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(RABBITMQ_CONFIG.QUEUES.ASSET_UPLOAD, { durable: true });
  await channel.prefetch(1);

  channel.consume(RABBITMQ_CONFIG.QUEUES.ASSET_UPLOAD, (msg) => {
    if (msg) {
      handleAssetTask(channel, msg);
    }
  });
}
