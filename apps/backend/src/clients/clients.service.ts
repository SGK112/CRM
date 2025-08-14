import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { parse } from 'fast-csv';
import * as stream from 'stream';

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

  async importCsv(file: { buffer: Buffer; originalname?: string }, workspaceId: string) {
    if (!file?.buffer) throw new BadRequestException('File buffer missing');
    const rows: any[] = [];
    const csvStream = new stream.Readable();
    csvStream.push(file.buffer);
    csvStream.push(null);

    return new Promise(async (resolve, reject) => {
      csvStream
        .pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
        .on('error', (error) => reject(new BadRequestException(error.message)))
        .on('data', (row) => rows.push(row))
        .on('end', async () => {
          const MAX_ROWS = 25000;
          if (rows.length > MAX_ROWS) {
            return reject(new BadRequestException(`CSV exceeds maximum allowed rows (${MAX_ROWS})`));
          }
          // Normalize + prepare
          const mapped = rows.map(raw => {
            const firstName = raw.firstName || raw.firstname || raw.first_name || (raw.name ? String(raw.name).split(' ')[0] : undefined);
            const lastName = raw.lastName || raw.lastname || raw.last_name || (raw.name ? String(raw.name).split(' ').slice(1).join(' ') : undefined) || '';
            const email = raw.email || raw.mail || '';
            const phone = raw.phone || raw.phoneNumber || raw.mobile || raw.cell || '';
            const company = raw.company || raw.organization || raw.companyName;
            const notes = raw.notes || raw.note;
            const tags = raw.tags ? String(raw.tags).split(/[;,]/).map((t: string) => t.trim()).filter(Boolean) : [];
            return { firstName, lastName, email: email.toLowerCase(), phone, company, notes, tags };
          }).filter(m => m.firstName && m.lastName && m.email);

          // Deduplicate by email keeping first occurrence
            const uniqueMap = new Map<string, typeof mapped[0]>();
            for (const m of mapped) {
              if (!uniqueMap.has(m.email)) uniqueMap.set(m.email, m);
            }
            const unique = Array.from(uniqueMap.values());

          const emails = unique.map(u => u.email);
          const existingList = await this.clientModel.find({ email: { $in: emails }, workspaceId }).select('_id email');
          const existingMap = new Map(existingList.map(e => [e.email, e] as const));

          const bulkOps: any[] = [];
          let createCount = 0; let updateCount = 0;
          for (const u of unique) {
            if (existingMap.has(u.email)) {
              bulkOps.push({
                updateOne: {
                  filter: { _id: existingMap.get(u.email)._id },
                  update: {
                    $set: {
                      firstName: u.firstName,
                      lastName: u.lastName,
                      phone: u.phone || undefined,
                      company: u.company || undefined,
                      notes: u.notes || undefined,
                      workspaceId,
                      isActive: true,
                    },
                    $addToSet: { tags: { $each: u.tags } }
                  }
                }
              });
              updateCount++;
            } else {
              bulkOps.push({
                insertOne: {
                  document: {
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    phone: u.phone || '',
                    company: u.company,
                    notes: u.notes,
                    tags: u.tags,
                    workspaceId,
                    isActive: true,
                  }
                }
              });
              createCount++;
            }
          }

          if (bulkOps.length) {
            await this.clientModel.bulkWrite(bulkOps, { ordered: false });
          }
          const processed = createCount + updateCount;
          resolve({
            count: processed,
            created: createCount,
            updated: updateCount,
            skipped: rows.length - processed,
            duplicatesCollapsed: mapped.length - unique.length,
          });
        });
    });
  }
}
