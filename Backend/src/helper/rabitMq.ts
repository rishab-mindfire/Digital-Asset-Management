import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';

// Simple helper to simulate CPU load
export const simulateHeavyWork = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Checks if RabbitMQ is reachable.
 * Useful for "Fail-Fast" logic before starting heavy uploads.
 */
export const isQueueReachable = async (): Promise<boolean> => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    await connection.close();
    return true;
  } catch (error) {
    console.error('[Health Check] RabbitMQ is offline');
    return false;
  }
};
