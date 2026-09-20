import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function fileStoragePlugin(): Plugin {
  return {
    name: 'vite-plugin-file-storage',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // API Route: Check storage status
        if (req.url === '/api/health') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', storage: 'active' }));
          return;
        }

        // API Route: File Upload endpoint
        if (req.url === '/api/upload' && req.method === 'POST') {
          try {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', async () => {
              try {
                const buffer = Buffer.concat(chunks);
                const contentType = req.headers['content-type'] || '';
                
                let fileBuffer: Buffer | null = null;
                let extension = 'jpg';

                if (contentType.includes('application/json')) {
                  const body = JSON.parse(buffer.toString('utf8'));
                  if (body.base64Data) {
                    const cleanBase64 = body.base64Data.replace(/^data:image\/\w+;base64,/, '');
                    fileBuffer = Buffer.from(cleanBase64, 'base64');
                  }
                  if (body.fileName) {
                    const ext = path.extname(body.fileName).replace('.', '').toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
                      extension = ext === 'jpeg' ? 'jpg' : ext;
                    }
                  }
                } else if (contentType.includes('multipart/form-data')) {
                  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
                  const boundary = boundaryMatch ? boundaryMatch[1] || boundaryMatch[2] : null;
                  if (boundary) {
                    const parts = buffer.toString('binary').split('--' + boundary);
                    for (const part of parts) {
                      if (part.includes('filename="')) {
                        const filenameMatch = part.match(/filename="([^"]+)"/);
                        if (filenameMatch) {
                          const ext = path.extname(filenameMatch[1]).replace('.', '').toLowerCase();
                          if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
                            extension = ext === 'jpeg' ? 'jpg' : ext;
                          }
                        }
                        const headerEnd = part.indexOf('\r\n\r\n');
                        if (headerEnd !== -1) {
                          const bodyStr = part.slice(headerEnd + 4, part.lastIndexOf('\r\n'));
                          fileBuffer = Buffer.from(bodyStr, 'binary');
                          break;
                        }
                      }
                    }
                  }
                } else {
                  fileBuffer = buffer;
                  if (contentType.includes('png')) extension = 'png';
                  else if (contentType.includes('webp')) extension = 'webp';
                }

                if (!fileBuffer || fileBuffer.length === 0) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: 'No image data received' }));
                  return;
                }

                // Ensure public/uploads directory exists
                const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
                if (!fs.existsSync(uploadsDir)) {
                  fs.mkdirSync(uploadsDir, { recursive: true });
                }

                const fileName = `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${extension}`;
                const filePath = path.join(uploadsDir, fileName);
                await fs.promises.writeFile(filePath, fileBuffer);

                const publicUrl = `/uploads/${fileName}`;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  url: publicUrl,
                  avatarUrl: publicUrl,
                  fileName: fileName,
                  size: fileBuffer.length
                }));
              } catch (parseErr) {
                console.error('Upload processing error:', parseErr);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Failed to process file' }));
              }
            });
          } catch (err) {
            console.error('Upload handler error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Upload failed' }));
          }
          return;
        }

        // =========================================================================
        // API Routes: 📚 Subject Summary Files Storage & Database
        // =========================================================================
        const parsedUrl = new URL(req.url || '', 'http://localhost');
        const pathname = parsedUrl.pathname;

        const DB_PATH = path.resolve(process.cwd(), 'data/summaries.json');
        const readSummariesDB = (): any[] => {
          try {
            if (!fs.existsSync(DB_PATH)) {
              const dataDir = path.dirname(DB_PATH);
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf8');
              return [];
            }
            const content = fs.readFileSync(DB_PATH, 'utf8');
            return JSON.parse(content || '[]');
          } catch (err) {
            console.error('Error reading summaries DB:', err);
            return [];
          }
        };

        const writeSummariesDB = (records: any[]) => {
          const dataDir = path.dirname(DB_PATH);
          if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
          fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2), 'utf8');
        };

        // 1. GET /api/summaries?userId=...&subjectId=...
        if (pathname === '/api/summaries' && req.method === 'GET') {
          const userId = parsedUrl.searchParams.get('userId');
          const subjectId = parsedUrl.searchParams.get('subjectId');

          if (!userId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'userId is required' }));
            return;
          }

          const records = readSummariesDB();
          let filtered = records.filter((r) => r.userId === userId);
          if (subjectId) {
            filtered = filtered.filter((r) => r.subjectId === subjectId);
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, files: filtered }));
          return;
        }

        // 2. POST /api/summaries/upload
        if (pathname === '/api/summaries/upload' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf8');
              const body = JSON.parse(rawBody);

              const {
                userId,
                subjectId,
                fileName,
                originalFileName,
                description,
                fileType,
                mimeType,
                base64Data,
              } = body;

              if (!userId || !subjectId || !originalFileName || !base64Data) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Missing required parameters' }));
                return;
              }

              // Strip potential Data URI header
              const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
              const fileBuffer = Buffer.from(cleanBase64, 'base64');

              // Max 25 MB file size limit validation
              const MAX_LIMIT = 25 * 1024 * 1024;
              if (fileBuffer.length > MAX_LIMIT) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: 'ไฟล์มีขนาดใหญ่เกินไป (ขนาดเกิน 25 MB) กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 25 MB',
                }));
                return;
              }

              // Folder Structure: public/storage/users/{userId}/subjects/{subjectId}/summaries/
              const safeUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
              const safeSubjectId = String(subjectId).replace(/[^a-zA-Z0-9_-]/g, '_');
              const targetDir = path.resolve(
                process.cwd(),
                'public/storage/users',
                safeUserId,
                'subjects',
                safeSubjectId,
                'summaries'
              );

              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }

              const fileId = `sum_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
              const ext = path.extname(originalFileName) || '.bin';
              const cleanBaseName = path.basename(originalFileName, ext).replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_');
              const diskFileName = `${fileId}_${cleanBaseName}${ext}`;
              const filePath = path.join(targetDir, diskFileName);

              await fs.promises.writeFile(filePath, fileBuffer);

              const storageUrl = `/storage/users/${safeUserId}/subjects/${safeSubjectId}/summaries/${diskFileName}`;

              const newRecord = {
                id: fileId,
                userId,
                subjectId,
                fileName: (fileName && fileName.trim()) ? fileName.trim() : originalFileName,
                originalFileName,
                fileType: fileType || 'other',
                mimeType: mimeType || 'application/octet-stream',
                fileSize: fileBuffer.length,
                storageUrl,
                description: description?.trim() || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              const allRecords = readSummariesDB();
              allRecords.unshift(newRecord);
              writeSummariesDB(allRecords);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, file: newRecord }));
            } catch (err: any) {
              console.error('Summary upload error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || 'Upload failed' }));
            }
          });
          return;
        }

        // 3. POST /api/summaries/update
        if (pathname === '/api/summaries/update' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf8');
              const body = JSON.parse(rawBody);
              const { id, userId, fileName, description, base64Data, originalFileName, mimeType, fileType } = body;

              if (!id || !userId) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'id and userId are required' }));
                return;
              }

              const allRecords = readSummariesDB();
              const idx = allRecords.findIndex((r) => r.id === id);
              if (idx === -1) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'File not found' }));
                return;
              }

              // Security check: Only owner can update
              if (allRecords[idx].userId !== userId) {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Unauthorized to update this file' }));
                return;
              }

              const record = allRecords[idx];

              // If file is being replaced
              if (base64Data && originalFileName) {
                const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
                const fileBuffer = Buffer.from(cleanBase64, 'base64');

                // Check size limit 25MB
                if (fileBuffer.length > 25 * 1024 * 1024) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: 'ไฟล์ใหม่มีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 25 MB',
                  }));
                  return;
                }

                // Remove old file from disk if exists
                if (record.storageUrl) {
                  const oldPath = path.resolve(process.cwd(), 'public', record.storageUrl.replace(/^\//, ''));
                  if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch {}
                  }
                }

                // Write new file
                const safeUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
                const safeSubjectId = String(record.subjectId).replace(/[^a-zA-Z0-9_-]/g, '_');
                const targetDir = path.resolve(
                  process.cwd(),
                  'public/storage/users',
                  safeUserId,
                  'subjects',
                  safeSubjectId,
                  'summaries'
                );
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

                const ext = path.extname(originalFileName) || '.bin';
                const cleanBaseName = path.basename(originalFileName, ext).replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_');
                const diskFileName = `${record.id}_${cleanBaseName}${ext}`;
                const filePath = path.join(targetDir, diskFileName);

                await fs.promises.writeFile(filePath, fileBuffer);

                record.originalFileName = originalFileName;
                record.fileSize = fileBuffer.length;
                record.mimeType = mimeType || record.mimeType;
                record.fileType = fileType || record.fileType;
                record.storageUrl = `/storage/users/${safeUserId}/subjects/${safeSubjectId}/summaries/${diskFileName}`;
              }

              if (fileName !== undefined) record.fileName = fileName.trim() || record.originalFileName;
              if (description !== undefined) record.description = description.trim();
              record.updatedAt = new Date().toISOString();

              allRecords[idx] = record;
              writeSummariesDB(allRecords);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, file: record }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || 'Update failed' }));
            }
          });
          return;
        }

        // 4. POST /api/summaries/delete
        if (pathname === '/api/summaries/delete' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf8');
              const body = JSON.parse(rawBody);
              const { id, userId } = body;

              if (!id || !userId) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'id and userId are required' }));
                return;
              }

              const allRecords = readSummariesDB();
              const idx = allRecords.findIndex((r) => r.id === id);
              if (idx === -1) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'File not found' }));
                return;
              }

              // Security check: Only owner can delete
              if (allRecords[idx].userId !== userId) {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Unauthorized to delete this file' }));
                return;
              }

              const [removed] = allRecords.splice(idx, 1);
              writeSummariesDB(allRecords);

              // Delete physical file on disk
              if (removed.storageUrl) {
                const diskPath = path.resolve(process.cwd(), 'public', removed.storageUrl.replace(/^\//, ''));
                if (fs.existsSync(diskPath)) {
                  try {
                    await fs.promises.unlink(diskPath);
                  } catch (delErr) {
                    console.warn('Could not delete physical file:', delErr);
                  }
                }
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, id }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || 'Delete failed' }));
            }
          });
          return;
        }

        // 5. GET /api/summaries/download?id=...&userId=...
        if (pathname === '/api/summaries/download' && req.method === 'GET') {
          const id = parsedUrl.searchParams.get('id');
          const userId = parsedUrl.searchParams.get('userId');

          if (!id || !userId) {
            res.statusCode = 400;
            res.end('id and userId are required');
            return;
          }

          const allRecords = readSummariesDB();
          const record = allRecords.find((r) => r.id === id);
          if (!record) {
            res.statusCode = 404;
            res.end('File not found');
            return;
          }

          if (record.userId !== userId) {
            res.statusCode = 403;
            res.end('Access denied');
            return;
          }

          const diskPath = path.resolve(process.cwd(), 'public', record.storageUrl.replace(/^\//, ''));
          if (!fs.existsSync(diskPath)) {
            res.statusCode = 404;
            res.end('Physical file not found on disk');
            return;
          }

          const encodedFilename = encodeURIComponent(record.originalFileName);
          res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
          res.setHeader('Content-Type', record.mimeType || 'application/octet-stream');
          fs.createReadStream(diskPath).pipe(res);
          return;
        }

        // 6. GET /api/summaries/view?id=...&userId=...
        if (pathname === '/api/summaries/view' && req.method === 'GET') {
          const id = parsedUrl.searchParams.get('id');
          const userId = parsedUrl.searchParams.get('userId');

          if (!id || !userId) {
            res.statusCode = 400;
            res.end('id and userId are required');
            return;
          }

          const allRecords = readSummariesDB();
          const record = allRecords.find((r) => r.id === id);
          if (!record) {
            res.statusCode = 404;
            res.end('File not found');
            return;
          }

          if (record.userId !== userId) {
            res.statusCode = 403;
            res.end('Access denied');
            return;
          }

          const diskPath = path.resolve(process.cwd(), 'public', record.storageUrl.replace(/^\//, ''));
          if (!fs.existsSync(diskPath)) {
            res.statusCode = 404;
            res.end('Physical file not found on disk');
            return;
          }

          res.setHeader('Content-Type', record.mimeType || 'application/octet-stream');
          res.setHeader('Content-Disposition', 'inline');
          fs.createReadStream(diskPath).pipe(res);
          return;
        }


        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), fileStoragePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
