import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import {
  extractPublicId,
  uploadToCloudinary,
} from 'src/utils/cloudinary.utils';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
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
  // uploading a file to cloud and saves metadata in db
  async uploadFile(file: Express.Multer.File, invoiceId: string) {
    try {
      const uploadResult = await uploadToCloudinary(file);
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

  // deletigna file
  async deleteFile(fileId: string) {
    try {
      const file = await this.prisma.file.findUnique({ where: { id: fileId } });
      if (!file || !file.url) {
        throw new Error('File not found');
      }

      const publicId = extractPublicId(file.url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
      await this.prisma.file.delete({ where: { id: fileId } });
      this.logger.log(`File ${fileId} deleted successfully`);
      return { message: 'File deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
