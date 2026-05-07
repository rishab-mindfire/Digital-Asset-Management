export const RABBITMQ_CONFIG = {
  URL: process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672',
  QUEUES: {
    QUEUE_NAME: process.env.RABBITMQ_QUEUE_NAME || 'asset_upload_processing',
  },
  RETRY: {
    MAX: 5,
    DELAY: 5000,
  },
  PATHS: {
    THUMBNAILS: process.env.RABBITMQ_THUMBNAILPATH || 'storage/thumbnails',
  },
};
