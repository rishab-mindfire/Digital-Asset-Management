import amqp from 'amqplib';

// Rabit mq url
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';

export const publishToQueue = async (
  queueName: string,
  data: Record<string, unknown>,
): Promise<void> => {
  let connection;
  try {
    // Establish connection
    connection = await amqp.connect(RABBITMQ_URL);

    // Create a channel
    const channel = await connection.createChannel();

    // Ensure the queue exists
    // true ensures the queue survives RabbitMQ restarts
    await channel.assertQueue(queueName, { durable: true });

    //  Send the message
    // true ensures the message survives RabbitMQ restarts
    const messageBuffer = Buffer.from(JSON.stringify(data));
    channel.sendToQueue(queueName, messageBuffer, {
      persistent: true,
    });

    // if (messageSent) {
    //   console.log(`[Queue Success] Task sent for Asset: ${data.assetId}`);
    // }

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
