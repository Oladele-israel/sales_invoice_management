import {
  IsNotEmpty,
  IsString,
  IsISO8601,
  IsNumber,
  IsEnum,
  Matches,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.01, { message: 'totalAmount must be a positive number' })
  totalAmount: number;

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}
