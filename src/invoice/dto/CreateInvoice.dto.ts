import {
  IsNotEmpty,
  IsString,
  IsISO8601,
  IsNumber,
  IsEnum,
  Matches,
  Min,
} from 'class-validator';

import { PaymentStatus } from '@prisma/client';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^INV-\d{4}$/, {
    message: 'invoiceNumber must follow the format INV-XXXX',
  })
  invoiceNumber: string;

  @IsNotEmpty()
  @IsISO8601()
  date: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'totalAmount must be a positive number' })
  totalAmount: number;

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}
