import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

export interface ProcessedImage {
  filename: string;
  path: string;
  buffer: Buffer;
}

export class ImageProcessor {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.resolve(process.cwd(), 'imagens_recebidas');
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir() {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  async processImage(
    imageBuffer: Buffer, 
    latitude: number, 
    longitude: number
  ): Promise<ProcessedImage> {
    // Generate unique filename
    const randomLetters = randomBytes(2).toString('hex').substring(0, 4);
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '').substring(0, 14);
    const filename = `${randomLetters}_${timestamp}.jpg`;
    const fullPath = path.join(this.uploadsDir, filename);

    // Process image: resize and add EXIF GPS data
    const processedBuffer = await sharp(imageBuffer)
      .resize(869, 896, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Save the processed image
    await fs.writeFile(fullPath, processedBuffer);

    return {
      filename,
      path: fullPath,
      buffer: processedBuffer
    };
  }

  async getImageBuffer(filename: string): Promise<Buffer | null> {
    try {
      const fullPath = path.join(this.uploadsDir, filename);
      return await fs.readFile(fullPath);
    } catch {
      return null;
    }
  }

  getImageUrl(filename: string): string {
    return `/api/images/${filename}`;
  }
}

export const imageProcessor = new ImageProcessor();
