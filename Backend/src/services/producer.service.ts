import amqp from 'amqplib';

// Use an environment variable for the RabbitMQ URL
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export const publishToQueue = async (queueName: string, data: any) => {
  try {
    // 1. Establish connection to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);

    // 2. Create a channel
    const channel = await connection.createChannel();

    // 3. Ensure the queue exists (Functional Req: Fault Tolerance)
    // durable: true means the queue will survive a RabbitMQ server restart
    await channel.assertQueue(queueName, { durable: true });

    // 4. Send the message
    // persistent: true means the message is saved to disk in RabbitMQ
    const messageSent = channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });

    if (messageSent) {
      console.log(`[Queue] Message sent to ${queueName}:`, data.assetId);
    }

    // 5. Close connection (Clean up)
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('[Queue Error] Failed to publish message:', error);
    // In a production app, you might want to log this to a file or monitoring service
    throw error;
  }
};
