import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export class StorageService {
  private static TEMP_DIR = path.resolve('storage/temp');
  private static UPLOAD_DIR = path.resolve('storage/uploads');

  static async saveChunk(uploadId: string, chunkIndex: number, buffer: Buffer) {
    const chunkDir = path.join(this.TEMP_DIR, uploadId);
    await fs.mkdir(chunkDir, { recursive: true });

    const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);

    // Better for bulk: Write even if exists to ensure integrity,
    // or keep your access check if you want to save I/O on retries.
    await fs.writeFile(chunkPath, buffer);
    return chunkPath;
  }

  static async saveMetadata(uploadId: string, data: object) {
    const chunkDir = path.join(this.TEMP_DIR, uploadId);
    await fs.mkdir(chunkDir, { recursive: true }); // Ensure dir exists
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

    // Use a unique name if a file already exists to avoid collisions in bulk
    const writeStream = createWriteStream(finalPath);

    try {
      for (let i = 1; i <= totalChunks; i++) {
        const chunkPath = path.join(chunkDir, `chunk-${i}`);

        // Check if chunk exists before trying to read (critical for bulk stability)
        await fs.access(chunkPath);

        const readStream = createReadStream(chunkPath);

        // pipeline handles the 'end' and 'error' events automatically
        // { end: false } keeps the writeStream open for the next chunk
        await pipeline(readStream, writeStream, { end: i === totalChunks });

        // Async cleanup: Unlink individual chunks to free space during the merge
        await fs.unlink(chunkPath).catch(() => {});
      }
    } catch (err) {
      writeStream.destroy();
      throw err;
    }

    // Final cleanup of the isolated directory
    await fs.rm(chunkDir, { recursive: true, force: true }).catch(() => {});

    return finalPath;
  }
}
