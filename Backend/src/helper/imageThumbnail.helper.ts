import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { handleGlobalError } from '../utils/globleError.js';

/**
 * Generates a compressed WebP thumbnail from a source image.
 */
export const generateThumbnail = async (
  inputPath: string,
  outputPath: string,
  width: number = 300,
  height: number = 300,
): Promise<sharp.OutputInfo | undefined> => {
  try {
    const dir = path.dirname(outputPath);
    // Ensure the destination directory exists before processing
    await fs.mkdir(dir, { recursive: true });

    // Resize image using 'cover' fit and convert to optimized WebP format
    return await sharp(inputPath)
      .resize(width, height, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);
  } catch (error) {
    // Gather diagnostic data to assist in debugging corrupted or missing files
    const stats = await fs.stat(inputPath).catch(() => null);
    const size = stats ? stats.size : 'FILE_NOT_FOUND';

    // Delegate to global handler with enriched error context
    handleGlobalError(
      new Error(
        `Sharp processing failed | Path: ${inputPath} | Size: ${size} | Details: ${error instanceof Error ? error.message : 'Unknown'}`,
      ),
    );
  }
};
