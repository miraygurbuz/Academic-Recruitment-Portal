import { Upload } from '@aws-sdk/lib-storage';
import s3Client, { s3Config } from '../config/s3Config.js';
import path from 'path';

export const uploadToS3 = async (fileBuffer, originalName, contentType) => {
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000000)}${path.extname(originalName)}`;
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: s3Config.bucketName,
      Key: uniqueName,
      Body: fileBuffer,
      ContentType: contentType,
      ContentDisposition: `inline; filename="${originalName}"`,
    }
  });

  await upload.done();
  
  return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${uniqueName}`;
};

export const deleteFromS3 = async (fileUrl) => {
  const key = fileUrl.split('/').pop();
  
  if (!key) {
    throw new Error('Geçersiz dosya URL\'i');
  }

  const deleteParams = {
    Bucket: s3Config.bucketName,
    Key: key
  };

  await s3Client.send(new DeleteObjectCommand(deleteParams));
};