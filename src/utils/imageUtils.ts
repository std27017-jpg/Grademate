/**
 * Profile Image Utility
 * Provides safe validation, resizing, compression, and error-handling for avatars.
 * Prevents UI freezes, memory bloat, and LocalStorage quota exhaustion.
 */

export interface ImageValidationResult {
  ok: boolean;
  message?: string;
}

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const MAX_ALLOWED_FILE_SIZE = 12 * 1024 * 1024; // 12 MB max input size
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp|gif|heic|heif|bmp|svg)$/i;

/**
 * Validates whether the selected file is a valid image within size bounds.
 */
export function validateImageFile(file: File | null | undefined): ImageValidationResult {
  if (!file) {
    return { ok: false, message: 'ไม่พบไฟล์ที่เลือก กรุณาเลือกไฟล์ใหม่อีกครั้ง' };
  }

  // Check MIME type or filename extension
  const isImageMime = file.type && file.type.startsWith('image/');
  const hasImageExt = ALLOWED_EXTENSIONS.test(file.name);

  if (!isImageMime && !hasImageExt) {
    return {
      ok: false,
      message: 'กรุณาเลือกไฟล์รูปภาพเท่านั้นค่ะ (รองรับ JPG, PNG, WEBP)',
    };
  }

  if (file.size > MAX_ALLOWED_FILE_SIZE) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      message: `ไฟล์รูปภาพมีขนาด ${sizeInMb}MB ซึ่งใหญ่เกินกำหนด (ไม่เกิน 12MB) กรุณาเลือกรูปขนาดเล็กลงค่ะ`,
    };
  }

  return { ok: true };
}

/**
 * Compresses and resizes an image file to a safe base64 Data URL.
 * Resizes avatar to maxDimension (default 400x400) and compresses to ~30KB-60KB.
 * Includes timeout guard to guarantee the UI never freezes or hangs.
 */
export async function compressAndResizeImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const { maxDimension = 400, quality = 0.85, mimeType = 'image/jpeg' } = options;

  return new Promise<string>((resolve, reject) => {
    // Timeout guard: if image processing takes > 8 seconds, fail gracefully
    const timer = setTimeout(() => {
      reject(new Error('การประมวลผลรูปภาพใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง'));
    }, 8000);

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        clearTimeout(timer);
        const { width, height } = img;

        // Calculate aspect-ratio-preserving dimensions (square center crop for clean circular avatar)
        const minSide = Math.min(width, height);
        const sourceX = (width - minSide) / 2;
        const sourceY = (height - minSide) / 2;

        const targetSize = Math.min(minSide, maxDimension);

        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('ไม่สามารถประมวลผล Canvas บนอุปกรณ์นี้ได้');
        }

        // Use smooth image interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw cropped square center
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          minSide,
          minSide,
          0,
          0,
          targetSize,
          targetSize
        );

        // Convert to lightweight compressed data URL
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        URL.revokeObjectURL(objectUrl);
        resolve(compressedDataUrl);
      } catch (err) {
        clearTimeout(timer);
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = (err) => {
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้ กรุณาตรวจสอบไฟล์อีกครั้ง'));
    };

    img.src = objectUrl;
  });
}
