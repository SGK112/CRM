import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  async create(createClientDto: any, workspaceId: string): Promise<Client> {
    const client = new this.clientModel({
      ...createClientDto,
      workspaceId,
    });
    return client.save();
  }

  async findAll(workspaceId: string): Promise<Client[]> {
    return this.clientModel.find({ workspaceId, isActive: true }).exec();
  }

  async findOne(id: string, workspaceId: string): Promise<Client> {
    return this.clientModel.findOne({ _id: id, workspaceId }).exec();
  }

  async update(id: string, updateClientDto: any, workspaceId: string): Promise<Client> {
    return this.clientModel.findOneAndUpdate(
      { _id: id, workspaceId },
      updateClientDto,
      { new: true }
    ).exec();
  }

  async remove(id: string, workspaceId: string): Promise<Client> {
    return this.clientModel.findOneAndUpdate(
      { _id: id, workspaceId },
      { isActive: false },
      { new: true }
    ).exec();
  }
}
