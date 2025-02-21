import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/CreateInvoice.dto';
import { UpdateInvoiceDto } from './dto/UpdateInvoice.dto';

@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Post('create')
  create(@Body() data: CreateInvoiceDto) {
    return this.invoiceService.create(data);
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
}
