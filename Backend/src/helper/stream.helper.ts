// file-stream.helper.ts
import { Response } from 'express';
import { createReadStream, statSync } from 'fs';
import mime from 'mime-types';

export const streamAsset = (res: Response, filePath: string, range?: string) => {
  const stats = statSync(filePath);
  const fileSize = stats.size;
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  // Video Range Logic
  if (range && contentType.startsWith('video/')) {
    const CHUNK_SIZE = 10 ** 6; // 1MB
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

  // Regular File Logic (Images, PDFs, other)
  res.writeHead(200, {
    'Content-Length': fileSize,
    'Content-Type': contentType,
    'Content-Disposition': 'inline',
  });
  return createReadStream(filePath).pipe(res);
};
