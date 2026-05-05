import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';

export class StorageService {
  private static TEMP_DIR = path.resolve('storage/temp');
  private static UPLOAD_DIR = path.resolve('storage/uploads');

  static async saveChunk(uploadId: string, chunkIndex: number, buffer: Buffer) {
    const chunkDir = path.join(this.TEMP_DIR, uploadId);
    await fs.mkdir(chunkDir, { recursive: true });

    const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);
    // Only write if it doesn't exist (basic optimization for retries)
    try {
      await fs.access(chunkPath);
    } catch {
      await fs.writeFile(chunkPath, buffer);
    }
    return chunkPath;
  }

  static async saveMetadata(uploadId: string, data: object) {
    const metaPath = path.join(this.TEMP_DIR, uploadId, 'chunk-session.json');
    await fs.writeFile(metaPath, JSON.stringify(data), 'utf8');
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

    // Clean up existing file if any
    await fs.unlink(finalPath).catch(() => {});

    const writeStream = createWriteStream(finalPath, { flags: 'a' });

    for (let i = 1; i <= totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk-${i}`);
      await new Promise<void>((resolve, reject) => {
        const readStream = createReadStream(chunkPath);
        readStream.pipe(writeStream, { end: false });
        readStream.on('error', reject);
        readStream.on('end', async () => {
          await fs.unlink(chunkPath); // Delete chunk after stream ends
          resolve();
        });
      });
    }

    writeStream.end();
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });

    // Clean up temp dir
    await fs.rm(chunkDir, { recursive: true, force: true });

    return finalPath;
  }
}
