/**
 * Client Storage and API Service for Subject Summary Files (📚 ไฟล์สรุปวิชา)
 * 
 * Features:
 * - 25MB max file size validation
 * - Supports PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, images (JPG, PNG, WEBP, GIF, SVG)
 * - Uploads to server storage: /api/summaries/upload -> public/storage/users/{userId}/subjects/{subjectId}/summaries/
 * - Companion IndexedDB cache for offline & instant responsiveness
 * - Zero Base64 into localStorage (strictly adheres to database metadata + file storage)
 * - Safe account separation: all operations bound to userId + subjectId
 */

import { SubjectSummaryFile, SummaryFileType } from '../types';

export const MAX_SUMMARY_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const IDB_DATABASE_NAME = 'mygrade_summaries_storage';
const IDB_STORE_BLOBS = 'summary_blobs';
const IDB_STORE_META = 'summary_meta';
const IDB_VERSION = 1;

/**
 * Determine high-level category type from filename and MIME type
 */
export function getSummaryFileType(filename: string, mimeType?: string): SummaryFileType {
  const ext = (filename || '').split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf' || mimeType?.includes('pdf')) return 'pdf';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'heic', 'bmp', 'avif'].includes(ext) || mimeType?.startsWith('image/')) {
    return 'image';
  }
  if (['doc', 'docx', 'odt'].includes(ext) || mimeType?.includes('word') || mimeType?.includes('officedocument.wordprocessingml')) {
    return 'doc';
  }
  if (['ppt', 'pptx', 'odp'].includes(ext) || mimeType?.includes('powerpoint') || mimeType?.includes('officedocument.presentationml')) {
    return 'ppt';
  }
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mimeType?.includes('excel') || mimeType?.includes('spreadsheetml')) {
    return 'xls';
  }
  if (['txt', 'rtf', 'md', 'markdown'].includes(ext) || mimeType?.startsWith('text/')) {
    return 'txt';
  }
  return 'other';
}

/**
 * Human-friendly Thai label for file types
 */
export function getFileTypeLabel(fileType: SummaryFileType): string {
  switch (fileType) {
    case 'pdf':
      return 'PDF';
    case 'image':
      return 'รูปภาพ';
    case 'doc':
      return 'เอกสาร Word';
    case 'ppt':
      return 'งานนำเสนอ PPT';
    case 'xls':
      return 'สเปรดชีต Excel';
    case 'txt':
      return 'ข้อความ TXT';
    default:
      return 'เอกสาร';
  }
}

/**
 * Format bytes to readable size string e.g. "2.4 MB" or "320 KB"
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format ISO date string into Thai Buddhist year format
 * e.g. "20 ก.ย. 2569" or "เพิ่มเมื่อ 20 ก.ย. 2569"
 */
export function formatSummaryThaiDate(isoString: string, prefix = 'เพิ่มเมื่อ '): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const month = thaiMonths[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${prefix}${day} ${month} ${year}`;
  } catch {
    return '';
  }
}

/**
 * Validate summary file size and supported types
 */
export function validateSummaryFile(file: File): { ok: boolean; error?: string } {
  if (!file) {
    return { ok: false, error: 'กรุณาเลือกไฟล์เอกสารหรือสรุป' };
  }

  if (file.size > MAX_SUMMARY_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      error: `ไฟล์มีขนาดใหญ่เกินไป (${sizeMb} MB) กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 25 MB`,
    };
  }

  // Study files: PDF, images, Word, PowerPoint, Excel, TXT, etc.
  const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
  const validExtensions = [
    'pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg',
    'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'txt', 'rtf', 'md'
  ];

  if (ext && !validExtensions.includes(ext)) {
    // If not in standard list, allow if image or text mime
    if (!file.type.startsWith('image/') && !file.type.startsWith('text/') && !file.type.includes('pdf')) {
      return {
        ok: false,
        error: 'รองรับไฟล์ PDF, Word (doc/docx), PowerPoint (ppt/pptx), Excel (xls/xlsx), TXT และรูปภาพ',
      };
    }
  }

  return { ok: true };
}

/**
 * Open IndexedDB for offline/companion cache
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(IDB_DATABASE_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_BLOBS)) {
        db.createObjectStore(IDB_STORE_BLOBS);
      }
      if (!db.objectStoreNames.contains(IDB_STORE_META)) {
        db.createObjectStore(IDB_STORE_META, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Cache Blob in IndexedDB
 */
export async function saveBlobCache(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_BLOBS, 'readwrite');
      const store = tx.objectStore(IDB_STORE_BLOBS);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // Non-fatal
  }
}

/**
 * Get Blob from IndexedDB cache
 */
export async function getBlobCache(id: string): Promise<Blob | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_BLOBS, 'readonly');
      const store = tx.objectStore(IDB_STORE_BLOBS);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Delete Blob from IndexedDB
 */
export async function deleteBlobCache(id: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_BLOBS, 'readwrite');
      const store = tx.objectStore(IDB_STORE_BLOBS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // Non-fatal
  }
}

/**
 * Convert File/Blob to Base64 for HTTP POST payload
 */
function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * 1. Fetch Summary Files for a User (and optional Subject)
 */
export async function fetchSummaryFiles(
  userId: string,
  subjectId?: string
): Promise<SubjectSummaryFile[]> {
  if (!userId) return [];

  try {
    let url = `/api/summaries?userId=${encodeURIComponent(userId)}`;
    if (subjectId) {
      url += `&subjectId=${encodeURIComponent(subjectId)}`;
    }

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.files)) {
        return data.files as SubjectSummaryFile[];
      }
    }
  } catch (err) {
    console.warn('[SummaryStorage] Network fetch failed, falling back to local cache:', err);
  }

  // Fallback to IndexedDB meta cache if network failed
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_META, 'readonly');
      const store = tx.objectStore(IDB_STORE_META);
      const req = store.getAll();
      req.onsuccess = () => {
        let list = (req.result as SubjectSummaryFile[]) || [];
        list = list.filter((item) => item.userId === userId);
        if (subjectId) {
          list = list.filter((item) => item.subjectId === subjectId);
        }
        resolve(list);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * 2. Upload a new summary file to server storage & database
 */
export async function uploadSummaryFile(
  file: File,
  params: {
    userId: string;
    subjectId: string;
    fileName?: string;
    description?: string;
  },
  onProgress?: (percent: number) => void
): Promise<SubjectSummaryFile> {
  const { userId, subjectId, fileName, description } = params;

  // Validation
  const val = validateSummaryFile(file);
  if (!val.ok) {
    throw new Error(val.error || 'ไฟล์ไม่ถูกต้อง');
  }

  if (onProgress) onProgress(20);

  const fileType = getSummaryFileType(file.name, file.type);
  const base64Data = await fileToBase64(file);

  if (onProgress) onProgress(50);

  const response = await fetch('/api/summaries/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      subjectId,
      fileName: (fileName && fileName.trim()) ? fileName.trim() : file.name,
      originalFileName: file.name,
      description: description?.trim() || '',
      fileType,
      mimeType: file.type || 'application/octet-stream',
      base64Data,
    }),
  });

  if (onProgress) onProgress(85);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
  }

  const result = await response.json();
  if (!result.success || !result.file) {
    throw new Error(result.error || 'ไม่สามารถบันทึกไฟล์ได้');
  }

  const savedRecord = result.file as SubjectSummaryFile;

  // Cache Blob in IndexedDB for offline instant preview
  await saveBlobCache(savedRecord.id, file);

  // Cache meta in IndexedDB
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE_META, 'readwrite');
    tx.objectStore(IDB_STORE_META).put(savedRecord);
  } catch {}

  if (onProgress) onProgress(100);

  return savedRecord;
}

/**
 * 3. Update summary file metadata (or optionally replace with new file)
 */
export async function updateSummaryFile(params: {
  id: string;
  userId: string;
  fileName?: string;
  description?: string;
  replacementFile?: File;
}): Promise<SubjectSummaryFile> {
  const { id, userId, fileName, description, replacementFile } = params;

  let base64Data: string | undefined;
  let originalFileName: string | undefined;
  let mimeType: string | undefined;
  let fileType: SummaryFileType | undefined;

  if (replacementFile) {
    const val = validateSummaryFile(replacementFile);
    if (!val.ok) {
      throw new Error(val.error || 'ไฟล์ใหม่ไม่ถูกต้อง');
    }
    base64Data = await fileToBase64(replacementFile);
    originalFileName = replacementFile.name;
    mimeType = replacementFile.type;
    fileType = getSummaryFileType(replacementFile.name, replacementFile.type);
  }

  const response = await fetch('/api/summaries/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      userId,
      fileName,
      description,
      base64Data,
      originalFileName,
      mimeType,
      fileType,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'ไม่สามารถอัปเดตข้อมูลไฟล์ได้');
  }

  const result = await response.json();
  if (!result.success || !result.file) {
    throw new Error(result.error || 'ไม่สามารถอัปเดตข้อมูลไฟล์ได้');
  }

  const updated = result.file as SubjectSummaryFile;

  if (replacementFile) {
    await saveBlobCache(updated.id, replacementFile);
  }

  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE_META, 'readwrite');
    tx.objectStore(IDB_STORE_META).put(updated);
  } catch {}

  return updated;
}

/**
 * 4. Delete summary file from server storage & database
 */
export async function deleteSummaryFile(id: string, userId: string): Promise<void> {
  const response = await fetch('/api/summaries/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, userId }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'ไม่สามารถลบไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
  }

  // Delete from IndexedDB cache
  await deleteBlobCache(id);
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE_META, 'readwrite');
    tx.objectStore(IDB_STORE_META).delete(id);
  } catch {}
}

/**
 * Download file trigger helper
 */
export function triggerFileDownload(file: SubjectSummaryFile, userId: string): void {
  // Use download endpoint which forces Content-Disposition: attachment
  const downloadUrl = `/api/summaries/download?id=${encodeURIComponent(file.id)}&userId=${encodeURIComponent(userId)}`;
  
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = file.originalFileName || file.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
