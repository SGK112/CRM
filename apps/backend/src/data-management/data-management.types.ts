export interface BulkActionResult {
  category: string;
  action?: string;
  affectedCount: number;
  success: boolean;
  error?: string;
}

export class BulkActionDto {
  action: 'delete' | 'archive' | 'organize';
  categories: string[];
  includeDemo?: boolean;
}

export class ExportDataDto {
  categories: string[];
  format: 'json' | 'csv';
}
