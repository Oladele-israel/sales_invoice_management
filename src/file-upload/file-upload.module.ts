import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [ConfigModule], // Load environment variables
  providers: [FileUploadService, PrismaService],
  exports: [FileUploadService],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
