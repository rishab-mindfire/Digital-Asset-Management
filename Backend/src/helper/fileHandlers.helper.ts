import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { finished } from 'stream/promises';
import { handleGlobalError } from '../utils/globleError.js';

const TEMP_DIR = path.resolve('storage/temp');
const UPLOAD_DIR = path.resolve('storage/uploads');

/**
 * Persists an individual file chunk to a temporary directory based on upload session.
 */
export const saveChunkBasedChunkId = async (
  uploadId: string,
  chunkIndex: number,
  buffer: Buffer,
) => {
  try {
    const chunkDir = path.join(TEMP_DIR, uploadId);
    await fs.mkdir(chunkDir, { recursive: true });

    const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);
    // Overwrite existing chunks to handle retry logic from the client
    await fs.writeFile(chunkPath, buffer);
    return chunkPath;
  } catch (error) {
    handleGlobalError(error);
  }
};

/**
 * Stores upload session metadata to track progress and validation data.
 */
export const saveFileSesionDetails = async (uploadId: string, data: object) => {
  try {
    const chunkDir = path.join(TEMP_DIR, uploadId);
    await fs.mkdir(chunkDir, { recursive: true });
    const metaPath = path.join(chunkDir, 'chunk-session.json');
    await fs.writeFile(metaPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    handleGlobalError(error);
  }
};

/**
 * Retrieves the stored metadata for a specific upload session.
 */
export const getFileSesionDetails = async (uploadId: string) => {
  try {
    const metaPath = path.join(TEMP_DIR, uploadId, 'chunk-session.json');
    const content = await fs.readFile(metaPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    handleGlobalError(error);
  }
};

/**
 * Combines all temporary chunks into a single final file and cleans up storage.
 */
export const mergeFinalChunks = async (
  uploadId: string,
  totalChunks: number,
  finalFilename: string,
): Promise<string | undefined> => {
  const chunkDir = path.join(TEMP_DIR, uploadId);
  const finalPath = path.join(UPLOAD_DIR, finalFilename);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const writeStream = createWriteStream(finalPath);

  try {
    for (let i = 1; i <= totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk-${i}`);
      await fs.access(chunkPath);

      const readStream = createReadStream(chunkPath);
      // Manually manage piping to prevent closing the write stream prematurely
      readStream.pipe(writeStream, { end: false });

      // Ensure each chunk is fully read before processing the next
      await new Promise<void>((resolve, reject) => {
        readStream.on('end', resolve);
        readStream.on('error', reject);
      });

      // Remove chunk immediately after piping to free up disk space
      await fs.unlink(chunkPath).catch(() => {});
    }

    // Finalize the write stream and wait for disk buffer flush
    writeStream.end();
    await finished(writeStream);
    return finalPath;
  } catch (err) {
    writeStream.destroy();
    handleGlobalError(err);
  } finally {
    // Ensure the temporary directory is removed regardless of success or failure
    await fs.rm(chunkDir, { recursive: true, force: true }).catch(() => {});
  }
};
