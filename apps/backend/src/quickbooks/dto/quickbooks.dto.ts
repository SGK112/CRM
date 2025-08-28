import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class QuickBooksConfig {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  companyId: string;

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  realmId: string;

  @IsString()
  baseUrl: string;

  @IsOptional()
  lastSyncDate?: Date;

  @IsBoolean()
  autoSync: boolean;

  syncSettings: {
    customers: boolean;
    items: boolean;
    estimates: boolean;
    invoices: boolean;
    payments: boolean;
  };
}

export class TestConnectionDto {
  @IsString()
  companyId: string;

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  realmId: string;

  @IsString()
  @IsOptional()
  baseUrl?: string;
}

export class SyncEstimateDto {
  @IsString()
  estimateId: string;

  @IsOptional()
  @IsBoolean()
  forceSync?: boolean;
}

export class SyncInvoiceDto {
  @IsString()
  invoiceId: string;

  @IsOptional()
  @IsBoolean()
  forceSync?: boolean;
}

export class QuickBooksItemDto {
  @IsString()
  Id: string;

  @IsString()
  Name: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  UnitPrice?: number;

  @IsOptional()
  @IsNumber()
  QtyOnHand?: number;

  @IsString()
  Type: 'Inventory' | 'NonInventory' | 'Service';
}

export class QuickBooksCustomerDto {
  @IsString()
  Id: string;

  @IsString()
  Name: string;

  @IsOptional()
  @IsString()
  CompanyName?: string;

  @IsOptional()
  @IsString()
  DisplayName?: string;
}

export class SyncResultDto {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;

  @IsOptional()
  data?: any;

  @IsOptional()
  errors?: string[];

  syncedAt: Date;
}
