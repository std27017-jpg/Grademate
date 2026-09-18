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
