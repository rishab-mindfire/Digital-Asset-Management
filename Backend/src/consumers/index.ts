import { handleGlobalError } from '../utils/globleError.js';
import { assetExpirationWorker } from './asset-expire/handleExpiretion.js';
import { assetUploadWorker } from './asset-processor/index.js';

export async function initWorkers(): Promise<void> {
  try {
    // Start the asset processor worker
    await assetUploadWorker();
    //Start expiration asset worker
    await assetExpirationWorker();
  } catch (error) {
    handleGlobalError(error);
  }
}
