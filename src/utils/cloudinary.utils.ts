import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export async function uploadToCloudinary(
  file: Express.Multer.File,
): Promise<UploadApiResponse> {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'invoice' },
      (error, result) => {
        if (error) {
          reject(new Error(error.message || 'File upload failed'));
        } else {
          resolve(result as UploadApiResponse);
        }
      },
    );

    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

export function extractPublicId(url: string): string | undefined {
  const parts = url.split('/');
  const lastPart = parts.pop();
  return lastPart?.split('.')[0];
}
