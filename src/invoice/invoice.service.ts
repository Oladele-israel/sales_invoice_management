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
      // Transform form-data fields
      const formattedData = {
        ...data,
        date: new Date(data.date), // Ensure date is converted correctly
        totalAmount: parseFloat(data.totalAmount as unknown as string), // Ensure totalAmount is a number
      };

      // Check for duplicate invoice number
      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { invoiceNumber: formattedData.invoiceNumber },
      });

      if (existingInvoice) {
        throw new BadRequestException('Invoice already exists');
      }

      // Create the new invoice
      const newInvoice = await this.prisma.invoice.create({
        data: formattedData,
      });

      // Upload files and save metadata
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
            connect: uploadedFiles.map((fileId) => ({ id: fileId })), // Connect file IDs to the invoice
          },
        },
        include: { files: true }, // Include files in the response
      });

      // Log the successful creation
      this.logger.log(`Invoice ${formattedData.invoiceNumber} created!`);

      // Return the response with the updated invoice
      return {
        message: 'Invoice created successfully',
        data: updatedInvoice, // Return the updated invoice with files
      };
    } catch (error) {
      // Log the error
      this.logger.error(`Error creating invoice: ${error.message}`);

      // Throw appropriate exception
      if (error instanceof BadRequestException) {
        throw error; // Re-throw known exceptions
      }
      throw new InternalServerErrorException('Failed to create invoice');
    }
  }
  //   get all the invoice from db--------------------------------------------------------------------
  async findAll() {
    try {
      const invoices = await this.prisma.invoice.findMany();
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

  //   update invoice by Id
  async update(id: string, data: UpdateInvoiceDto) {
    try {
      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!existingInvoice) {
        throw new NotFoundException('Invoice not found');
      }

      // Check for duplicate invoice number (if invoiceNumber is being updated)
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

      // Update the invoice
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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Re-throw known exceptions
      }
      throw new InternalServerErrorException('Failed to update invoice');
    }
  }

  //   delete by Id logic
  async delete(id: string) {
    try {
      // Check if the invoice exists
      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!existingInvoice) {
        throw new NotFoundException('Invoice not found');
      }

      // Delete the invoice
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
}
