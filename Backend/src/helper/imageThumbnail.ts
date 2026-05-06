import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export const generateThumbnail = async (
  inputPath: string,
  outputPath: string,
  width: number = 300,
  height: number = 300,
): Promise<sharp.OutputInfo | undefined> => {
  try {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    return await sharp(inputPath)
      .resize(width, height, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);
  } catch (error) {
    // Check if the file actually exists and has size
    const stats = await fs.stat(inputPath).catch(() => null);
    const size = stats ? stats.size : 'FILE_NOT_FOUND';
    if (error instanceof Error) {
      throw new Error(`Sharp Error: ${error.message} | Path: ${inputPath} | File Size: ${size}`);
    }
  }
};
