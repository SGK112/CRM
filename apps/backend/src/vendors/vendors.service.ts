import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';

@Injectable()
export class VendorsService {
  constructor(@InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>) {}

  create(dto: Partial<Vendor>, workspaceId: string) {
    return this.vendorModel.create({ ...dto, workspaceId });
  }

  findAll(workspaceId: string) {
    return this.vendorModel.find({ workspaceId }).sort({ name: 1 });
  }

  findOne(id: string, workspaceId: string) {
    return this.vendorModel.findOne({ _id: id, workspaceId });
  }

  async update(id: string, dto: Partial<Vendor>, workspaceId: string) {
    return this.vendorModel.findOneAndUpdate({ _id: id, workspaceId }, { $set: dto }, { new: true });
  }
}
