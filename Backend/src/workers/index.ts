import { startAssetWorker } from './asset-processor/index.js';

export async function initWorkers(): Promise<void> {
  try {
    // Start the asset processor worker
    await startAssetWorker();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error('Worker initialization failed');
  }
}
