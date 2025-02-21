import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { InvoiceModule } from './invoice/invoice.module';
import { FileUploadService } from './file-upload/file-upload.service';
import { ConfigModule } from '@nestjs/config';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  controllers: [],
  providers: [],
  imports: [
    PrismaModule,
    InvoiceModule,
    FileUploadModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
