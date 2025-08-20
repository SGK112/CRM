import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { Estimate, EstimateDocument } from '../estimates/schemas/estimate.schema';

interface CreateInvoiceDto { clientId: string; projectId?: string; items: { name:string; description?:string; quantity?:number; unitPrice?:number; taxable?:boolean; }[]; taxRate?: number; notes?: string; dueDate?: string; }
interface UpdateInvoiceDto { items?: { name:string; description?:string; quantity?:number; unitPrice?:number; taxable?:boolean; }[]; taxRate?: number; notes?: string; dueDate?: string; }
interface RecordPaymentDto { amount: number; note?: string; date?: string; }

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Estimate.name) private estimateModel: Model<EstimateDocument>,
  ) {}

  private compute(doc: InvoiceDocument) {
    let subtotal=0; doc.items.forEach(li=> { li.quantity = li.quantity||1; li.unitPrice = li.unitPrice||0; li.total = (li.quantity||1) * (li.unitPrice||0); subtotal += li.total; });
    doc.subtotal = subtotal;
    const taxAmount = (doc.taxRate||0) > 0 ? subtotal * (doc.taxRate||0)/100 : 0;
    doc.taxAmount = taxAmount;
    doc.total = subtotal + taxAmount;
  }

  private async nextNumber(workspaceId: string) {
    const count = await this.invoiceModel.countDocuments({ workspaceId });
    return `INV-${1000 + count + 1}`;
  }

  async create(dto: CreateInvoiceDto, workspaceId: string) {
    const number = await this.nextNumber(workspaceId);
    const doc = new this.invoiceModel({ workspaceId, number, clientId: dto.clientId, projectId: dto.projectId, items: dto.items||[], taxRate: dto.taxRate||0, notes: dto.notes, dueDate: dto.dueDate ? new Date(dto.dueDate): undefined });
    this.compute(doc as any);
    await doc.save();
    return doc;
  }

  async fromEstimate(estimateId: string, workspaceId: string) {
    const est = await this.estimateModel.findOne({ _id: estimateId, workspaceId });
    if (!est) return null;
    const existingConverted = await this.invoiceModel.findOne({ estimateId: est._id.toString(), workspaceId });
    if (existingConverted) return existingConverted;
    const number = await this.nextNumber(workspaceId);
    const items = est.items.map(li => ({ name: li.name, description: li.description, quantity: li.quantity, unitPrice: li.sellPrice, taxable: li.taxable }));
    const doc = new this.invoiceModel({ workspaceId, number, clientId: est.clientId, projectId: est.projectId, items, taxRate: est.taxRate, notes: est.notes, estimateId: est._id.toString() });
    this.compute(doc as any);
    await doc.save();
    est.status = 'converted';
    await est.save();
    return doc;
  }

  list(workspaceId: string) { return this.invoiceModel.find({ workspaceId }).sort({ createdAt: -1 }); }
  get(id: string, workspaceId: string) { return this.invoiceModel.findOne({ _id: id, workspaceId }); }

  async update(id: string, workspaceId: string, dto: UpdateInvoiceDto) {
    const doc = await this.invoiceModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    if (dto.items) {
      doc.items = dto.items.map(li => ({
        name: li.name,
        description: li.description,
        quantity: li.quantity||1,
        unitPrice: li.unitPrice||0,
        total: (li.quantity||1) * (li.unitPrice||0),
        taxable: !!li.taxable,
      })) as any;
    }
    if (dto.taxRate !== undefined) doc.taxRate = dto.taxRate;
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.dueDate !== undefined) doc.dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;
    this.compute(doc as any);
    await doc.save();
    return doc;
  }

  async send(id: string, workspaceId: string) {
    const doc = await this.invoiceModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    if (doc.status === 'draft') {
      doc.status = 'sent';
      await doc.save();
    }
    // TODO: email integration
    return doc;
  }

  async recordPayment(id: string, workspaceId: string, dto: RecordPaymentDto) {
    const doc = await this.invoiceModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    const amount = dto.amount || 0;
    doc.amountPaid = (doc.amountPaid || 0) + amount;
    if (doc.amountPaid >= doc.total) doc.status = 'paid'; else if (doc.amountPaid > 0) doc.status = 'partial';
    await doc.save();
    // TODO: store payment record document (future)
    return doc;
  }
}
