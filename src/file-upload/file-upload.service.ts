import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Express.Multer.File, invoiceId: string) {
    try {
      // Upload file to Cloudinary
      const uploadResult = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: 'invoice' },
            (error, result) => {
              if (error) {
                reject(new Error(error.message || 'File upload failed')); // Wrap in Error
                return;
              } else resolve(result as UploadApiResponse);
            },
          );

          // Convert buffer to stream
          const readableStream = new Readable();
          readableStream.push(file.buffer);
          readableStream.push(null);
          readableStream.pipe(uploadStream);
        },
      );

      console.log('this is the result -->', uploadResult);

      // Save file metadata to the database
      const fileMetadata = await this.prisma.file.create({
        data: {
          filename: file.originalname,
          url: uploadResult.secure_url,
          invoiceId,
        },
      });

      return fileMetadata;
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw new Error('Failed to upload file: ' + error.message);
    }
  }

  async deleteFile(fileId: string) {
    try {
      // Delete file from Cloudinary
      const file = await this.prisma.file.findUnique({ where: { id: fileId } });
      if (file && file.url) {
        const publicId = file.url.split('/').pop()?.split('.')[0]; // Use optional chaining
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }

        // Delete file metadata from the database
        await this.prisma.file.delete({ where: { id: fileId } });
        console.log(`File ${fileId} deleted successfully`);
        return { message: 'File deleted successfully' };
      } else {
        throw new Error('File not found');
      }
    } catch (error) {
      console.error('Error deleting file:', error); // Log the entire error object
      throw new Error(
        'Failed to delete file: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }
}
