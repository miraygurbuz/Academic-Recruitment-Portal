import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const downloadFile = asyncHandler(async (req, res, next) => {
  const filename = req.params.filename;
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Dosya bulunamadı');
  }

  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';

  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
  };

  if (mimeTypes[ext]) {
    contentType = mimeTypes[ext];
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const fileStream = fs.createReadStream(filePath);

  fileStream.on('error', (error) => {
    res.status(500).send('Dosya okunamadı');
  });

  fileStream.pipe(res);
});