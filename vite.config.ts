import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

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
        // API Route: ✨ AI Quick Fill Parser (/api/ai-parse)
        // Uses @google/genai with gemini-3.8-flash securely on the server
        // =========================================================================
        if (req.url === '/api/ai-parse' && req.method === 'POST') {
          try {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', async () => {
              try {
                const rawBody = Buffer.concat(chunks).toString('utf8');
                const body = JSON.parse(rawBody || '{}');
                const { text, scope = 'all', fileBase64, fileMimeType, userContext } = body;

                const ai = getGeminiClient();
                if (!ai) {
                  // No Gemini API Key configured, client will gracefully fallback to rule engine
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    fallbackRequired: true,
                    error: 'NO_API_KEY',
                    message: 'Gemini API Key is not set, falling back to local smart parser'
                  }));
                  return;
                }

                // Prepare contents for Gemini 3.8 Flash
                const existingSubjectsStr = userContext?.existingSubjects
                  ? userContext.existingSubjects.map((s: any) => `${s.name} (รหัส: ${s.code || '-'}, ID: ${s.id})`).join(', ')
                  : 'ไม่มีข้อมูลวิชาเดิม';

                const promptParts: any[] = [];

                if (fileBase64 && fileMimeType) {
                  const cleanData = fileBase64.replace(/^data:[^;]+;base64,/, '');
                  promptParts.push({
                    inlineData: {
                      mimeType: fileMimeType,
                      data: cleanData,
                    },
                  });
                }

                const userPromptText = `วิเคราะห์และแยกข้อมูลจากข้อความ/เอกสาร/รูปภาพนี้:
---
${text || '(วิเคราะห์จากไฟล์/รูปภาพที่แนบมา)'}
---
บริบทของผู้ใช้:
- วิชาเดิมในระบบของผู้ใช้: ${existingSubjectsStr}
- ขอบเขตที่สนใจ (Scope): ${scope}
- วันที่ปัจจุบัน: 21 กันยายน 2569 (2026-09-21)

กรุณาแปลงข้อมูลเป็น JSON ตาม Schema ที่กำหนดไว้อย่างแม่นยำ ไม่สร้างข้อมูลเท็จที่ไม่มีในเอกสารหรือข้อความ`;

                promptParts.push({ text: userPromptText });

                const systemInstruction = `คุณคือ "AI ผู้ช่วยกรอกข้อมูลของ MyGrade" (MyGrade Smart Form Assistant)
วันที่อ้างอิงปัจจุบัน: วันที่ 21 กันยายน พ.ศ. 2569 (2026-09-21)
หน้าที่ของคุณ: วิเคราะห์ข้อความหรือรูปภาพตารางสอบ/การบ้านภาษาไทยของนักเรียน แยกข้อมูลเข้าฟิลด์ของระบบ MyGrade โดยไม่สร้างข้อมูลเท็จ

กฎการแยกข้อมูล:
1. วันที่: หากระบุแค่วันที่และเดือน (เช่น "28 ก.ย.", "25 กันยายน") ให้ถือเป็นปีการศึกษาปัจจุบัน พ.ศ. 2569 (2026) ในรูปแบบ YYYY-MM-DD
2. เวลา: แปลงเป็น HH:mm เช่น "9 โมง" -> "09:00", "13:30 น." -> "13:30"
3. ข้อมูลส่วนตัว (Profile): แยกชื่อ-นามสกุล, ระดับชั้น (เช่น ม.4), ห้อง (เช่น 2), เลขที่, เกรดเป้าหมาย (0-4), คณะ/อาชีพในฝัน, มหาวิทยาลัย
4. งาน (Tasks): ชื่องาน, ชื่อวิชาที่ตรงกัน, กำหนดส่ง, เวลา, คะแนนเต็ม
5. การสอบ (Exams): ชื่อวิชา, วันสอบ, เวลาเริ่ม-สิ้นสุด, ประเภท (midterm หรือ final), หัวข้อสอบ (topics เป็น array), ห้องสอบ
6. วิชาใหม่ (Subjects): หากผู้ใช้บอกเพิ่มวิชาใหม่ ให้แยกชื่อวิชา รหัส หน่วยกิต เกรดเป้าหมาย
7. เป้าหมาย (Goals): รายการเป้าหมายหรือ to-do ที่ไม่ใช่เกรด
8. ผลงาน (Portfolio): ผลงาน เกียรติบัตร รางวัล
9. แผนอ่านหนังสือ (Study): วิชา, หัวข้อ, วันที่, ระยะเวลาอ่าน (นาที)

ผลลัพธ์ต้องเป็น JSON เท่านั้น โครงสร้าง:
{
  "summary": "สรุปสั้นๆ เป็นภาษาไทยว่าเข้าใจข้อมูลอะไรบ้าง",
  "profile": {
    "fullName": "...",
    "gradeLevel": "...",
    "room": "...",
    "studentNumber": "...",
    "schoolName": "...",
    "targetGpa": 3.8,
    "dreamCareer": "...",
    "dreamFaculty": "...",
    "dreamUniversity": "..."
  },
  "tasks": [
    {
      "title": "...",
      "subjectQuery": "...",
      "dueDate": "YYYY-MM-DD",
      "dueTime": "HH:mm",
      "periodKey": "preMidterm",
      "maxScore": 10,
      "notes": "..."
    }
  ],
  "exams": [
    {
      "subjectQuery": "...",
      "examDate": "YYYY-MM-DD",
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "examType": "midterm",
      "room": "...",
      "topics": ["..."],
      "tips": "..."
    }
  ],
  "subjects": [],
  "goals": [],
  "portfolio": [],
  "studyPlans": [],
  "warnings": []
}`;

                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: [
                    {
                      role: 'user',
                      parts: promptParts,
                    },
                  ],
                  config: {
                    responseMimeType: 'application/json',
                    systemInstruction,
                  },
                });

                const candidateText = response.text || '';
                let parsedResult: any = {};
                try {
                  parsedResult = JSON.parse(candidateText);
                } catch (parseError) {
                  // If wrapped in markdown code fence
                  const clean = candidateText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
                  parsedResult = JSON.parse(clean);
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  data: parsedResult,
                  rawText: candidateText,
                }));
              } catch (genAiError: any) {
                console.error('Gemini API Error:', genAiError);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  fallbackRequired: true,
                  error: genAiError?.message || 'Gemini processing failed',
                }));
              }
            });
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, fallbackRequired: true, error: err?.message }));
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
