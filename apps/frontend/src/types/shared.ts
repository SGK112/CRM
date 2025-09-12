// Shared types for estimates and invoices

export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  name?: string; // Computed field
}

export interface Project {
  _id: string;
  title: string;
  clientId?: string;
  status?: string;
  description?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
}

export interface LineItem {
  priceItemId?: string;
  name: string;
  description?: string;
  quantity: number;
  baseCost: number;
  marginPct: number;
  taxable: boolean;
  sku?: string;
  sellPrice?: number;
  category?: string;
}

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
  caption?: string;
  category?: 'before' | 'progress' | 'after' | 'reference' | 'damage' | 'other';
}

export interface Note {
  id: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: Date;
  category?: 'general' | 'client' | 'progress' | 'issue' | 'reminder' | 'invoice' | 'material';
  tags?: string[];
  isPrivate?: boolean;
  attachments?: string[];
}
