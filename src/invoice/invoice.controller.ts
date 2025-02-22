import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/CreateInvoice.dto';
import { UpdateInvoiceDto } from './dto/UpdateInvoice.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body() data: CreateInvoiceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.invoiceService.create(data, files);
  }

  @Get()
  findAllInvoice() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  findOneInvoice(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  updateInvoice(@Param('id') id: string, @Body() data: UpdateInvoiceDto) {
    return this.invoiceService.update(id, data);
  }

  @Delete(':id')
  deleteInvoice(@Param('id') id: string) {
    return this.invoiceService.delete(id);
  }

  @Get('filter/payment')
  filterByPaymentStatus(@Query('paymentStatus') paymentStatus: string) {
    if (!paymentStatus) {
      throw new BadRequestException('Payment status is required');
    }
    return this.invoiceService.filterByPaymentStatus(paymentStatus);
  }

  @Get('filter/date')
  filterByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
    return this.invoiceService.filterByDateRange(startDate, endDate);
  }
}
