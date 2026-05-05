import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { finished } from 'stream/promises';

export class StorageService {
  private static TEMP_DIR = path.resolve('storage/temp');
  private static UPLOAD_DIR = path.resolve('storage/uploads');

  static async saveChunk(uploadId: string, chunkIndex: number, buffer: Buffer) {
    const chunkDir = path.join(this.TEMP_DIR, uploadId);
    await fs.mkdir(chunkDir, { recursive: true });

    const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);

    // Better for bulk: Write even if exists to ensure integrity,
    await fs.writeFile(chunkPath, buffer);
    return chunkPath;
  }

  static async saveMetadata(uploadId: string, data: object) {
    const chunkDir = path.join(this.TEMP_DIR, uploadId);
    await fs.mkdir(chunkDir, { recursive: true });
    const metaPath = path.join(chunkDir, 'chunk-session.json');
    await fs.writeFile(metaPath, JSON.stringify(data, null, 2), 'utf8');
  }
  static async getMetadata(uploadId: string) {
    const metaPath = path.join(this.TEMP_DIR, uploadId, 'chunk-session.json');
    const content = await fs.readFile(metaPath, 'utf8');
    return JSON.parse(content);
  }

  static async mergeChunks(
    uploadId: string,
    totalChunks: number,
    finalFilename: string,
  ): Promise<string> {
    const chunkDir = path.join(this.TEMP_DIR, uploadId);
    const finalPath = path.join(this.UPLOAD_DIR, finalFilename);

    await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    const writeStream = createWriteStream(finalPath);

    try {
      for (let i = 1; i <= totalChunks; i++) {
        const chunkPath = path.join(chunkDir, `chunk-${i}`);
        await fs.access(chunkPath);

        const readStream = createReadStream(chunkPath);

        // Pipe avoid pipeline() creating multiple listeners on writeStream
        readStream.pipe(writeStream, { end: false });

        // Wait for the current chunk to finish reading
        await new Promise<void>((resolve, reject) => {
          readStream.on('end', () => resolve());
          readStream.on('error', (err) => reject(err));
        });

        // Clean up chunk immediately to save disk space
        await fs.unlink(chunkPath).catch(() => {});
      }

      // Signal end of writing and wait for the file to be fully flushed to disk
      writeStream.end();
      await finished(writeStream);
    } catch (err) {
      writeStream.destroy();
      throw err;
    } finally {
      // Final cleanup of the isolated directory
      await fs.rm(chunkDir, { recursive: true, force: true }).catch(() => {});
    }

    return finalPath;
  }
}
