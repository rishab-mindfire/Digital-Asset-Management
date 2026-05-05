export const RABBITMQ_CONFIG = {
  URL: process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672',
  QUEUES: {
    ASSET_UPLOAD: 'asset_upload_processing',
  },
  RETRY: {
    MAX: 5,
    DELAY: 5000,
  },
  PATHS: {
    THUMBNAILS: 'storage/thumbnails',
  },
};
