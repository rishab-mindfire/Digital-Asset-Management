import { consumeExpiration } from './asset-expire/handleExpiretion.js';
import { startAssetWorker } from './asset-processor/index.js';

export async function initWorkers(): Promise<void> {
  try {
    // Start the asset processor worker
    await startAssetWorker();

    //Start expiration asset worker
    await consumeExpiration();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
}
