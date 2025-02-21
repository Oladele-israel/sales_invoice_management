import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  controllers: [],
  providers: [],
  imports: [PrismaModule, InvoiceModule],
})
export class AppModule {}
