import {
  IsOptional,
  IsString,
  IsISO8601,
  IsNumber,
  IsEnum,
  Min,
  Matches,
} from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  @Matches(/^INV-\d{4}$/, {
    message: 'invoiceNumber must follow the format INV-XXXX',
  })
  invoiceNumber?: string;

  @IsOptional()
  @IsISO8601()
  date?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: 'totalAmount must be a positive number' })
  totalAmount?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
