import { handleGlobalError } from '../utils/globleError.js';
import { consumeExpiration } from './asset-expire/handleExpiretion.js';
import { startAssetWorker } from './asset-processor/index.js';

export async function initWorkers(): Promise<void> {
  try {
    // Start the asset processor worker
    await startAssetWorker();
    //Start expiration asset worker
    await consumeExpiration();
  } catch (error) {
    handleGlobalError(error);
  }
}
