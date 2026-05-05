import { startAssetWorker } from './asset-processor/index.js';

export async function initWorkers() {
  try {
    console.log('--- Initializing Background Workers ---');

    // Start the asset processor
    await startAssetWorker();

    // You can easily add more workers here in the future
    // await startEmailWorker();
  } catch (error) {
    console.error('Failed to initialize workers:', error);
    process.exit(1);
  }
}
