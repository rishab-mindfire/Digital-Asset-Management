import crypto from 'crypto';
import fs from 'fs';
import { handleGlobalError } from '../utils/globleError.js';

/**
 * Generates an MD5 hash for a file to detect duplicates and verify integrity.
 */
export async function getFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);

      // Incrementally update hash to maintain low memory footprint
      stream.on('data', (data) => hash.update(data));

      // Finalize and return hex digest upon completion
      stream.on('end', () => resolve(hash.digest('hex')));

      // Forward stream failures to the promise reject handler
      stream.on('error', (err) => reject(err));
    } catch (error: unknown) {
      // Catch synchronous initialization errors
      handleGlobalError(error);
    }
  });
}
