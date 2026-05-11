import amqp from 'amqplib';
import { AssetModel } from '../../models/asset.model.js';

// Rabit mq url
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';

export const consumeExpiration = async () => {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  const queue = 'asset_deletion_worker';

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg) {
      const { assetId } = JSON.parse(msg.content.toString());

      // Logic to delete from DB and Disk
      const asset = await AssetModel.findById(assetId);
      if (asset) {
        // hard Delete
        // if (fs.existsSync(asset.localPath)) {
        //   await fs.promises.unlink(asset.localPath);
        // }

        //soft delete
        await AssetModel.findByIdAndUpdate(assetId, { expiresAt: new Date(), isExpired: true });

        //console.log(`Asset ${assetId} expired and deleted.`);
      }

      channel.ack(msg);
    }
  });
};
