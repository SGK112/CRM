export interface LineItem {
  _id?: string;
  name: string;
  description?: string;
  quantity: number;
  baseCost?: number;
  marginPct?: number;
  sellPrice?: number;
  unitPrice?: number;
  taxable?: boolean;
  sku?: string;
  total?: number;
}

export interface Project {
  _id: string;
  title: string;
  status: string;
}

export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface Estimate {
  _id: string;
  number: string;
  status: string;
  items: LineItem[];
  subtotalSell: number;
  subtotalCost: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  client?: Client;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  _id: string;
  number: string;
  status: string;
  items: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid?: number;
  notes?: string;
  dueDate?: string;
  client?: Client;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}
