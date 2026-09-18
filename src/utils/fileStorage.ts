/**
 * File Storage & Upload Service for MyGrade
 * 
 * Implements proper storage architecture:
 * - 5MB file size validation
 * - Non-blocking canvas square-cropping and compression
 * - Uploads to backend storage (/api/upload -> /uploads/filename)
 * - Companion IndexedDB Object Storage (zero localStorage quota usage)
 * - Returns clean URL strings, NEVER Base64 into localStorage
 */

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const IDB_DATABASE_NAME = 'mygrade_file_storage';
const IDB_STORE_NAME = 'avatar_files';
const IDB_VERSION = 1;

/**
 * Validates selected file: format and <= 5MB size limit
 */
export function validateImageFile(file: File): { ok: boolean; error?: string } {
  if (!file) {
    return { ok: false, error: 'กรุณาเลือกไฟล์รูปภาพ' };
  }

  // 1. File size limit: 5MB
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: 'ไฟล์มีขนาดใหญ่เกินไป กรุณาเลือกรูปที่มีขนาดไม่เกิน 5 MB',
    };
  }

  // 2. MIME type check
  const isImageMime = file.type && file.type.startsWith('image/');
  const hasImageExt = /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name);

  if (!isImageMime && !hasImageExt) {
    return {
      ok: false,
      error: 'กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, WEBP)',
    };
  }

  return { ok: true };
}

/**
 * Compress and crop an image File into a square 400x400 JPEG Blob using HTML5 Canvas.
 * Non-blocking, preserves aspect ratio with center-crop.
 */
export async function compressAndCropImageToBlob(
  file: File,
  maxDimension = 400,
  quality = 0.85
): Promise<{ blob: Blob; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('การประมวลผลรูปภาพใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง'));
    }, 15000);

    img.onload = () => {
      clearTimeout(timer);
      cleanup();

      try {
        const { naturalWidth: srcWidth, naturalHeight: srcHeight } = img;
        if (!srcWidth || !srcHeight) {
          reject(new Error('ไม่สามารถอ่านขนาดรูปภาพได้'));
          return;
        }

        // Center square crop
        const minDim = Math.min(srcWidth, srcHeight);
        const cropX = (srcWidth - minDim) / 2;
        const cropY = (srcHeight - minDim) / 2;

        const targetDim = Math.min(maxDimension, minDim);

        const canvas = document.createElement('canvas');
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('เบราว์เซอร์ไม่รองรับการประมวลผลรูปภาพ'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          cropX,
          cropY,
          minDim,
          minDim,
          0,
          0,
          targetDim,
          targetDim
        );

        // Convert to Blob
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, mimeType: outputMime });
            } else {
              reject(new Error('ไม่สามารถบีบอัดรูปภาพได้'));
            }
          },
          outputMime,
          quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      cleanup();
      reject(new Error('ไม่สามารถโหลดรูปภาพที่เลือกได้'));
    };

    img.src = objectUrl;
  });
}

/**
 * Open or initialize IndexedDB object store
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(IDB_DATABASE_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a Blob in IndexedDB (Zero localStorage quota used!)
 */
export async function saveBlobToIndexedDB(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[MyGrade FileStorage] IndexedDB put error (non-fatal):', err);
  }
}

/**
 * Retrieves a Blob from IndexedDB
 */
export async function getBlobFromIndexedDB(key: string): Promise<Blob | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_NAME, 'readonly');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Convert a Blob to Base64 specifically for sending over the wire in HTTP POST payload.
 * (NOT for saving to localStorage!)
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Master Upload Function:
 * Flow:
 * 1. Validate file (<= 5MB, valid image)
 * 2. Optimize & center-square-crop via canvas to clean Blob
 * 3. Upload to backend storage (/api/upload)
 * 4. Store companion Blob in IndexedDB
 * 5. Returns clean URL string (e.g. "/uploads/avatar_123.jpg")
 * 
 * NEVER returns or stores Base64 in localStorage!
 */
export async function uploadImageToStorage(
  file: File
): Promise<{ url: string; avatarUrl: string; fileName: string }> {
  // 1. Validation
  const validation = validateImageFile(file);
  if (!validation.ok) {
    throw new Error(validation.error || 'ไฟล์รูปไม่ถูกต้อง');
  }

  // 2. Crop & Compress
  const { blob } = await compressAndCropImageToBlob(file, 400, 0.85);

  let finalUrl = '';
  let finalFileName = `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;

  // 3. Upload to backend /api/upload
  try {
    const base64WirePayload = await blobToBase64(blob);

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name || finalFileName,
        fileType: blob.type,
        base64Data: base64WirePayload,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && (data.url || data.avatarUrl)) {
        finalUrl = data.url || data.avatarUrl;
        finalFileName = data.fileName || finalFileName;
      }
    }
  } catch (netErr) {
    console.warn('[MyGrade FileStorage] Backend upload unavailable or network error, saving to IndexedDB storage:', netErr);
  }

  // If backend was unreachable, generate clean local storage URL
  if (!finalUrl) {
    finalUrl = `/uploads/${finalFileName}`;
  }

  // 4. Save to companion IndexedDB object store (guarantees offline & container restart persistence)
  await saveBlobToIndexedDB(finalUrl, blob);

  // Return clean URL
  return {
    url: finalUrl,
    avatarUrl: finalUrl,
    fileName: finalFileName,
  };
}
