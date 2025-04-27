import asyncHandler from 'express-async-handler';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client, { s3Config } from '../config/s3Config.js';

export const downloadFile = asyncHandler(async (req, res) => {
  try {
    const fileUrl = decodeURIComponent(req.query.url);

    if (!fileUrl) {
      return res.status(400).json({ error: 'Dosya URL\'i gereklidir' });
    }

    let key = '';
    try {
      const urlObj = new URL(fileUrl);
      key = urlObj.pathname.substring(1);
    } catch (e) {
      key = fileUrl.split('/').pop();
    }

    const command = new GetObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key
    });
    
    const response = await s3Client.send(command);

    const contentType = response.ContentType || 'application/octet-stream';
    const filename = key.split('/').pop();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    response.Body.pipe(res);
  } catch (error) {
    return res.status(500).json({
      error: 'Dosya indirme hatası',
      message: error.message
    });
  }
});