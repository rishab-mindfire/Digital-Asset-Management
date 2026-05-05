import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export class MediaService {
  /**
   * Generates a webp thumbnail for a given image file.
   *
   * @param inputPath - Absolute path to the source file
   * @param outputPath - Absolute path where the thumbnail should be saved
   * @param width - Optional width (default 300)
   * @param height - Optional height (default 300)
   */
  static async generateThumbnail(
    inputPath: string,
    outputPath: string,
    width: number = 300,
    height: number = 300,
  ): Promise<sharp.OutputInfo> {
    try {
      // Ensure the directory exists before writing
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });

      return await sharp(inputPath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .webp({
          quality: 80,
          effort: 4, // Controls CPU effort vs compression (1-6)
        })
        .toFile(outputPath);
    } catch (error) {
      throw new Error(
        `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Example: Get metadata about an image (dimensions, etc.)
   */
  static async getImageMetadata(filePath: string) {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        hasAlpha: metadata.hasAlpha,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Could not read image metadata');
      }
    }
  }

  /**
   * Example: Validate if a file is a valid image sharp can process
   */
  static async isValidImage(filePath: string): Promise<boolean> {
    try {
      await sharp(filePath).metadata();
      return true;
    } catch {
      return false;
    }
  }
}
