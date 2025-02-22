import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/CreateInvoice.dto';
import { UpdateInvoiceDto } from './dto/UpdateInvoice.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  //   logic to create invoice
  async create(data: CreateInvoiceDto, files: Express.Multer.File[] = []) {
    try {
      const formattedData = {
        ...data,
        date: new Date(data.date), // Ensure date is converted correctly
        totalAmount: parseFloat(data.totalAmount as unknown as string), // Ensure totalAmount is a number
      };

      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { invoiceNumber: formattedData.invoiceNumber },
      });

      if (existingInvoice) {
        throw new BadRequestException('Invoice already exists');
      }

      const newInvoice = await this.prisma.invoice.create({
        data: formattedData,
      });

      const uploadedFiles: string[] = [];
      for (const file of files) {
        const fileMetadata = await this.fileUploadService.uploadFile(
          file,
          newInvoice.id,
        );
        uploadedFiles.push(fileMetadata.id);
      }

      // Update the invoice to connect the uploaded files
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: newInvoice.id },
        data: {
          files: {
            connect: uploadedFiles.map((fileId) => ({ id: fileId })),
          },
        },
        include: { files: true },
      });

      this.logger.log(`Invoice ${formattedData.invoiceNumber} created!`);

      return {
        message: 'Invoice created successfully',
        data: updatedInvoice,
      };
    } catch (error) {
      this.logger.error(`Error creating invoice: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create invoice');
    }
  }

  //   get all the invoice from db--------------------------------------------------------------------
  async findAll() {
    try {
      const invoices = await this.prisma.invoice.findMany();
      if (invoices.length === 0) {
        throw new NotFoundException('No invoices found');
      }
      this.logger.log('Fetched all invoices');
      return { message: 'all invoice fetch successfully', data: invoices };
    } catch (error) {
      this.logger.error(`Failed to fetch invoices: ${error}`);
      throw new InternalServerErrorException('Failed to fetch invoices');
    }
  }

  //   fetches a single invoice by ID
  async findOne(id: string) {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      this.logger.log(`Fetched invoice: ${invoice.invoiceNumber}`);
      return { message: ' invoice fetched successfully', data: invoice };
    } catch (error) {
      this.logger.error(`Failed to fetch invoice: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch invoice');
    }
  }

  //-------------------------------------------   update invoice by Id
  async update(id: string, data: UpdateInvoiceDto) {
    try {
      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!existingInvoice) {
        throw new NotFoundException('Invoice not found');
      }

      if (
        data.invoiceNumber &&
        data.invoiceNumber !== existingInvoice.invoiceNumber
      ) {
        const duplicateInvoice = await this.prisma.invoice.findUnique({
          where: { invoiceNumber: data.invoiceNumber },
        });

        if (duplicateInvoice) {
          throw new BadRequestException('Invoice number already exists');
        }
      }

      const updatedInvoice = await this.prisma.invoice.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
      });

      this.logger.log(`Updated invoice: ${updatedInvoice.invoiceNumber}`);
      return { message: 'updated successfully', Data: updatedInvoice };
    } catch (error) {
      this.logger.error(`Failed to update invoice: ${error}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update invoice');
    }
  }

  //---------------------------------------------------------------------   delete by Id logic
  async delete(id: string) {
    try {
      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!existingInvoice) {
        throw new NotFoundException('Invoice not found');
      }
      await this.prisma.invoice.delete({
        where: { id },
      });

      this.logger.log(`Deleted invoice: ${existingInvoice.invoiceNumber}`);
      return { message: 'Invoice deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete invoice: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete invoice');
    }
  }

  // ---------------------------sorting and filtering-------
  // filter by payment status
  async filterByPaymentStatus(paymentStatus) {
    try {
      this.logger.log(`Filtering by payment status: ${paymentStatus}`);
      const invoices = await this.prisma.invoice.findMany({
        where: { paymentStatus },
      });

      this.logger.log(`Fetched invoices: ${JSON.stringify(invoices)}`);
      return {
        message: 'Invoices fetched successfully',
        data: invoices,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch invoices by payment status: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch invoices');
    }
  }

  // filterBy date range
  async filterByDateRange(startDate: string, endDate: string) {
    try {
      if (new Date(startDate) > new Date(endDate)) {
        throw new BadRequestException('Start date cannot be after end date');
      }

      this.logger.log(`Filtering by date range: ${startDate} to ${endDate}`);

      const invoices = await this.prisma.invoice.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });

      this.logger.log(`Fetched invoices: ${JSON.stringify(invoices)}`);

      return {
        message: 'Invoices fetched successfully',
        data: invoices,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch invoices by date range: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch invoices');
    }
  }
}
