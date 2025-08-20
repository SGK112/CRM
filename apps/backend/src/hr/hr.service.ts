import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';

@Injectable()
export class HrService {
  constructor(@InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>) {}

  async create(data: Partial<Employee>): Promise<Employee> {
    const created = new this.employeeModel(data);
    return created.save();
  }

  async findAll(workspaceId: string, opts: { page?: number; limit?: number; search?: string; active?: boolean } = {}): Promise<{ data: Employee[]; total: number; page: number; pages: number; }> {
    const page = Math.max(1, opts.page || 1);
    const limit = Math.min(100, Math.max(1, opts.limit || 20));
    const filter: any = { workspaceId };
    if (typeof opts.active === 'boolean') filter.active = opts.active;
    if (opts.search) {
      const regex = new RegExp(opts.search, 'i');
      filter.$or = [ { firstName: regex }, { lastName: regex }, { email: regex }, { department: regex }, { position: regex } ];
    }
    const total = await this.employeeModel.countDocuments(filter);
    const data = await this.employeeModel.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).lean();
    const pages = Math.ceil(total / limit) || 1;
    return { data, total, page, pages };
  }

  async findOne(id: string, workspaceId: string): Promise<Employee> {
    const emp = await this.employeeModel.findOne({ _id: id, workspaceId }).lean();
    if (!emp) throw new NotFoundException('Employee not found');
    return emp as any;
  }

  async update(id: string, workspaceId: string, data: Partial<Employee>): Promise<Employee> {
    const updated = await this.employeeModel.findOneAndUpdate({ _id: id, workspaceId }, { $set: data }, { new: true });
    if (!updated) throw new NotFoundException('Employee not found');
    return updated;
  }

  async remove(id: string, workspaceId: string): Promise<void> {
    const res = await this.employeeModel.deleteOne({ _id: id, workspaceId });
    if (res.deletedCount === 0) throw new NotFoundException('Employee not found');
  }

  async addCertification(id: string, workspaceId: string, cert: any) {
    return this.employeeModel.findOneAndUpdate(
      { _id: id, workspaceId },
      { $push: { certifications: cert } },
      { new: true }
    );
  }

  async addTraining(id: string, workspaceId: string, training: any) {
    return this.employeeModel.findOneAndUpdate(
      { _id: id, workspaceId },
      { $push: { trainings: training } },
      { new: true }
    );
  }

  async addDisciplinaryAction(id: string, workspaceId: string, action: any) {
    return this.employeeModel.findOneAndUpdate(
      { _id: id, workspaceId },
      { $push: { disciplinaryActions: action } },
      { new: true }
    );
  }

  async addTimeEntry(id: string, workspaceId: string, entry: any) {
    return this.employeeModel.findOneAndUpdate(
      { _id: id, workspaceId },
      { $push: { timeEntries: entry } },
      { new: true }
    );
  }
}
