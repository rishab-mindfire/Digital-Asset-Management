import { Response } from 'express';
import { createReadStream, statSync } from 'fs';
import mime from 'mime-types';
import { handleGlobalError } from '../utils/globleError.js';

/**
 * Handles partial content streaming for videos and full content delivery for other assets.
 */
export const streamAsset = (res: Response, filePath: string, range?: string) => {
  try {
    const stats = statSync(filePath);
    const fileSize = stats.size;
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    // Implement HTTP 206 Partial Content logic for video seeking
    if (range && contentType.startsWith('video/')) {
      const CHUNK_SIZE = 10 ** 6; // Fixed 1MB buffer per chunk
      const start = Number(range.replace(/\D/g, ''));
      const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
      });

      return createReadStream(filePath, { start, end }).pipe(res);
    }

    // Standard HTTP 200 delivery for images, documents, and small files
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Content-Disposition': 'inline',
    });

    return createReadStream(filePath).pipe(res);
  } catch (error: unknown) {
    // Catch file access or stream initialization failures
    handleGlobalError(error);
  }
};
