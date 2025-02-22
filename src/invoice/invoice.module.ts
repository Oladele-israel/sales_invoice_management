import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileUploadController } from 'src/file-upload/file-upload.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InvoiceController, FileUploadController],
  providers: [InvoiceService, FileUploadService],
})
export class InvoiceModule {}
