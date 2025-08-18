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

  async importCsv(
    file: { buffer: Buffer; originalname?: string },
    workspaceId: string,
    dryRun = false,
    options?: { allowEmailOnly?: boolean; allowPhoneOnly?: boolean; synthEmailFromPhone?: boolean; dedupeByPhone?: boolean }
  ) {
    if (!file?.buffer) throw new BadRequestException('File buffer missing');
    const rows: any[] = [];
    const csvStream = new stream.Readable();
    csvStream.push(file.buffer);
    csvStream.push(null);

    return new Promise((resolve, reject) => {
      csvStream
        .pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
        .on('error', (error) => reject(new BadRequestException(error.message)))
        .on('data', (row) => rows.push(row))
        .on('end', () => {
          const MAX_ROWS = 25000;
          if (rows.length > MAX_ROWS) {
            return reject(new BadRequestException(`CSV exceeds maximum allowed rows (${MAX_ROWS})`));
          }

          const skipReasonsCount: Record<string, number> = {};
          const registerSkip = (reason: string) => { skipReasonsCount[reason] = (skipReasonsCount[reason] || 0) + 1; };

          const headerCanon = (key: string) => key.toLowerCase().replace(/^\uFEFF/, '').trim().replace(/\s+/g, '_');
          const mappedRaw = rows.map(raw => {
            const norm: any = {};
            for (const k of Object.keys(raw)) {
              if (!k) continue;
              norm[headerCanon(k)] = raw[k];
            }
            const nameField = norm.full_name || norm.customer_name || norm.client_name || norm.name;
            let firstName = norm.first_name || norm.firstname || norm['first_name*'];
            let lastName = norm.last_name || norm.lastname;
            if (!firstName && nameField) {
              const parts = String(nameField).trim().split(/\s+/);
              firstName = parts[0];
              lastName = parts.slice(1).join(' ');
            }
            // Support multiple possible phone column variants (e.g., "Phone Number 1", "Second Contact Phone Number")
            const rawPhoneCandidate =
              norm.phone_number ||
              norm.phone_number_1 ||
              norm["phone_number1"] ||
              norm.phone ||
              norm.phonenumber ||
              norm.phoneNumber ||
              norm.mobile ||
              norm.cell ||
              norm.second_contact_phone_number ||
              norm.secondary_phone ||
              '';
            let phone = rawPhoneCandidate;
            if (!phone && firstName && /^\+?\d[\d\-()\s]+$/.test(firstName)) {
              phone = firstName;
              if (!lastName) lastName = '';
              firstName = 'Contact';
            }
            const cleanPhone = phone ? String(phone).replace(/[^\d]/g, '') : '';
            const email = (norm.email || norm.mail || '').toString().trim();
            const company = norm.company || norm.organization || norm.company_name || norm.organisation;
            // Capture notes plus optionally second contact name as appended note
            let notes = norm.notes || norm.note;
            if (norm.second_contact_name) {
              const sc = String(norm.second_contact_name).trim();
              if (sc) {
                notes = (notes ? notes + '\n' : '') + `Second contact: ${sc}`;
              }
            }
            const tags = norm.tags ? String(norm.tags).split(/[;,]/).map((t: string) => t.trim()).filter(Boolean) : [];
            const statusRaw = (norm.status || norm.client_status || '').toString();
            let status = 'lead';
            if (/active/i.test(statusRaw)) status = 'active';
            else if (/new\s*lead/i.test(statusRaw)) status = 'lead';
            else if (/contractor|ready\s*for\s*measure/i.test(statusRaw)) status = 'active';
            else if (/not\s*interested|inactive|closed/i.test(statusRaw)) status = 'inactive';
            const source = (norm.source || norm.source_channel || norm.source_campaign || norm.how_did_you_hear_about_us) ?
              (norm.source || norm.source_channel || norm.source_campaign || norm.how_did_you_hear_about_us).toString() : '';
            return { firstName: firstName?.toString().trim(), lastName: (lastName?.toString().trim()) || '', email: email.toLowerCase(), phone: cleanPhone, company, notes, tags, status, source };
          });

          const { allowEmailOnly = false, allowPhoneOnly = true, synthEmailFromPhone = true, dedupeByPhone = true } = options || {};

          const mapped: typeof mappedRaw = [];
          for (const m of mappedRaw) {
            if (!m.firstName) { registerSkip('missing_first_name'); continue; }
            if (!m.email) {
              if (m.phone && synthEmailFromPhone) {
                m.email = `${m.phone}@import.local`;
                registerSkip('synth_email');
              } else if (!m.phone && allowEmailOnly === false) {
                registerSkip('missing_email');
                continue;
              }
            }
            if (!m.phone) {
              if (!allowEmailOnly) { registerSkip('missing_phone'); continue; }
            }
            if (!m.email && !m.phone) { registerSkip('missing_core_fields'); continue; }
            if (!m.lastName) m.lastName = '-';
            mapped.push(m);
          }

          const emailMap = new Map<string, typeof mapped[0]>();
          const phoneMap = new Map<string, typeof mapped[0]>();
          for (const m of mapped) {
            if (m.email && !emailMap.has(m.email)) emailMap.set(m.email, m);
            if (dedupeByPhone && m.phone) {
              if (!phoneMap.has(m.phone)) phoneMap.set(m.phone, m);
            }
          }
          const unique: typeof mapped = Array.from(emailMap.values());
          if (dedupeByPhone) {
            for (const row of phoneMap.values()) {
              if ((!row.email || !emailMap.has(row.email)) && !unique.includes(row)) unique.push(row);
            }
          }

            const emails = unique.filter(u => u.email).map(u => u.email);
            (async () => {
            const existingList = await this.clientModel.find({ email: { $in: emails }, workspaceId }).select('_id email');
            const existingMap = new Map(existingList.map(e => [e.email, e] as const));

            const bulkOps: any[] = [];
            let createCount = 0; let updateCount = 0;
            for (const u of unique) {
              const hasEmail = !!u.email && existingMap.has(u.email);
              if (hasEmail) {
                bulkOps.push({
                  updateOne: {
                    filter: { _id: existingMap.get(u.email)._id },
                    update: {
                      $set: {
                        firstName: u.firstName,
                        lastName: u.lastName,
                        phone: u.phone || undefined,
                        company: u.company || undefined,
                        notes: u.notes,
                        workspaceId,
                        isActive: true,
                        status: u.status,
                        source: u.source,
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
                      email: u.email || (u.phone ? `${u.phone}@import.local` : undefined),
                      phone: u.phone || '',
                      company: u.company,
                      notes: u.notes,
                      tags: u.tags,
                      workspaceId,
                      isActive: true,
                      status: u.status,
                      source: u.source,
                    }
                  }
                });
                createCount++;
              }
            }

            if (!dryRun && bulkOps.length) {
              await this.clientModel.bulkWrite(bulkOps, { ordered: false });
            }
            const processed = createCount + updateCount;
            resolve({
              count: processed,
              created: createCount,
              updated: updateCount,
              skipped: rows.length - processed,
              duplicatesCollapsed: mapped.length - unique.length,
              skipReasons: skipReasonsCount,
              preview: mapped.slice(0, 5),
              dryRun,
              options: { allowEmailOnly, allowPhoneOnly, synthEmailFromPhone, dedupeByPhone },
              remediation: this.buildRemediation(skipReasonsCount)
            });
          })().catch(err => reject(new BadRequestException(err.message)));
        });
    });
  }

  private buildRemediation(skipReasons: Record<string, number>) {
    const suggestions: { reason: string; suggestion: string }[] = [];
    if (skipReasons.missing_phone) suggestions.push({ reason: 'missing_phone', suggestion: 'Provide a phone column or enable allowEmailOnly option.' });
    if (skipReasons.missing_email) suggestions.push({ reason: 'missing_email', suggestion: 'Add email addresses or enable synthEmailFromPhone (requires phone).' });
    if (skipReasons.synth_email) suggestions.push({ reason: 'synth_email', suggestion: 'Consider collecting real emails; synthesized values are placeholders.' });
    if (skipReasons.missing_first_name) suggestions.push({ reason: 'missing_first_name', suggestion: 'Add first_name column or a full_name field that can be split.' });
    if (skipReasons.missing_core_fields) suggestions.push({ reason: 'missing_core_fields', suggestion: 'Row lacks both email and phone; supply at least one identifier.' });
    return suggestions;
  }
}
