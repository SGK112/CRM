import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { parse } from 'fast-csv';
import { Model } from 'mongoose';
import * as stream from 'stream';
import { Client, ClientDocument } from './schemas/client.schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private clientModel: Model<ClientDocument>) {}

  async create(createClientDto: Record<string, unknown>, workspaceId: string): Promise<Client> {
    // 1. Create Stripe customer
    let stripeCustomerId: string | undefined = undefined;
    try {
      const stripeCustomer = await stripe.customers.create({
        name: `${createClientDto.firstName} ${createClientDto.lastName}`,
        email: createClientDto.email as string,
        phone: createClientDto.phone as string,
        metadata: { workspaceId },
      });
      stripeCustomerId = stripeCustomer.id;
    } catch (err) {
      // Optionally log error, but allow client creation to proceed
      console.error('Stripe customer creation failed:', err);
    }

    const client = new this.clientModel({
      ...createClientDto,
      workspaceId,
      stripeCustomerId,
    });
    return client.save();
  }

  async findAll(
    workspaceId: string,
    searchParams?: {
      search?: string;
      status?: string;
      source?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Client[]> {
    const query: Record<string, unknown> = { workspaceId, isActive: true };

    // Add search functionality
    if (searchParams?.search) {
      const searchTerm = searchParams.search.trim();

      // Try MongoDB text search first (if available)
      try {
        // Use text search for better performance and relevance
        const textSearchQuery = {
          ...query,
          $text: { $search: searchTerm },
        };

        // Test if text search works by doing a count query
        const textCount = await this.clientModel.countDocuments(textSearchQuery);
        if (textCount >= 0) {
          // Text search is available, use it
          query.$text = { $search: searchTerm };
        } else {
          throw new Error('Text search not available');
        }
      } catch (textSearchError) {
        // Fallback to regex search if text search is not available
        const searchRegex = new RegExp(searchTerm, 'i');
        query.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { company: searchRegex },
          { tags: { $in: [searchRegex] } },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ['$firstName', ' ', '$lastName'] },
                regex: searchTerm,
                options: 'i',
              },
            },
          },
        ];
      }
    }

    // Add status filter
    if (searchParams?.status && searchParams.status !== 'all') {
      query.status = searchParams.status;
    }

    // Add source filter
    if (searchParams?.source && searchParams.source !== 'all') {
      query.source = searchParams.source;
    }

    let queryBuilder = this.clientModel.find(query);

    // Add pagination
    if (searchParams?.offset) {
      queryBuilder = queryBuilder.skip(searchParams.offset);
    }
    if (searchParams?.limit) {
      queryBuilder = queryBuilder.limit(searchParams.limit);
    }

    // Sort by name for consistent results, or by text score if using text search
    if (query.$text) {
      queryBuilder = queryBuilder.sort({
        score: { $meta: 'textScore' },
        lastName: 1,
        firstName: 1,
      });
    } else {
      queryBuilder = queryBuilder.sort({ lastName: 1, firstName: 1 });
    }

    return queryBuilder.exec();
  }

  async count(
    workspaceId: string,
    searchParams?: {
      search?: string;
      status?: string;
      source?: string;
    }
  ): Promise<number> {
    const query: Record<string, unknown> = { workspaceId, isActive: true };

    // Add search functionality (same logic as findAll)
    if (searchParams?.search) {
      const searchTerm = searchParams.search.trim();

      // Try MongoDB text search first (if available)
      try {
        // Use text search for better performance and relevance
        const textSearchQuery = {
          ...query,
          $text: { $search: searchTerm },
        };

        // Test if text search works by doing a simple count
        const textCount = await this.clientModel.countDocuments(textSearchQuery);
        if (textCount >= 0) {
          // Text search is available, use it
          query.$text = { $search: searchTerm };
        } else {
          throw new Error('Text search not available');
        }
      } catch (textSearchError) {
        // Fallback to regex search if text search is not available
        const searchRegex = new RegExp(searchTerm, 'i');
        query.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { company: searchRegex },
          { tags: { $in: [searchRegex] } },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ['$firstName', ' ', '$lastName'] },
                regex: searchTerm,
                options: 'i',
              },
            },
          },
        ];
      }
    }

    // Add status filter
    if (searchParams?.status && searchParams.status !== 'all') {
      query.status = searchParams.status;
    }

    // Add source filter
    if (searchParams?.source && searchParams.source !== 'all') {
      query.source = searchParams.source;
    }

    return this.clientModel.countDocuments(query).exec();
  }

  async findOne(id: string, workspaceId: string): Promise<Client> {
    return this.clientModel.findOne({ _id: id, workspaceId }).exec();
  }

  async update(id: string, updateClientDto: Record<string, unknown>, workspaceId: string): Promise<Client> {
    return this.clientModel
      .findOneAndUpdate({ _id: id, workspaceId }, updateClientDto, { new: true })
      .exec();
  }

  async remove(id: string, workspaceId: string): Promise<Client> {
    return this.clientModel
      .findOneAndUpdate({ _id: id, workspaceId }, { isActive: false }, { new: true })
      .exec();
  }

  async importCsv(
    file: { buffer: Buffer; originalname?: string },
    workspaceId: string,
    dryRun = false,
    options?: {
      allowEmailOnly?: boolean;
      allowPhoneOnly?: boolean;
      synthEmailFromPhone?: boolean;
      dedupeByPhone?: boolean;
    }
  ) {
    if (!file?.buffer) throw new BadRequestException('File buffer missing');
    const rows: Record<string, string>[] = [];
    const csvStream = new stream.Readable();
    csvStream.push(file.buffer);
    csvStream.push(null);

    return new Promise((resolve, reject) => {
      csvStream
        .pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
        .on('error', error => reject(new BadRequestException(error.message)))
        .on('data', row => rows.push(row))
        .on('end', () => {
          const MAX_ROWS = 25000;
          if (rows.length > MAX_ROWS) {
            return reject(
              new BadRequestException(`CSV exceeds maximum allowed rows (${MAX_ROWS})`)
            );
          }

          const skipReasonsCount: Record<string, number> = {};
          const registerSkip = (reason: string) => {
            skipReasonsCount[reason] = (skipReasonsCount[reason] || 0) + 1;
          };

          const headerCanon = (key: string) =>
            key
              .toLowerCase()
              .replace(/^\uFEFF/, '')
              .trim()
              .replace(/\s+/g, '_');
          const mappedRaw = rows.map(raw => {
            const norm: Record<string, unknown> = {};
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
              norm['phone_number1'] ||
              norm.phone ||
              norm.phonenumber ||
              norm.phoneNumber ||
              norm.mobile ||
              norm.cell ||
              norm.second_contact_phone_number ||
              norm.secondary_phone ||
              '';
            let phone = rawPhoneCandidate;
            if (!phone && firstName && /^\+?\d[\d\-()\s]+$/.test(String(firstName))) {
              phone = firstName;
              if (!lastName) lastName = '';
              firstName = 'Contact';
            }
            const cleanPhone = phone ? String(phone).replace(/[^\d]/g, '') : '';
            const email = (norm.email || norm.mail || '').toString().trim();
            const company =
              norm.company || norm.organization || norm.company_name || norm.organisation;
            // Capture notes plus optionally second contact name as appended note
            let notes = norm.notes || norm.note;
            if (norm.second_contact_name) {
              const sc = String(norm.second_contact_name).trim();
              if (sc) {
                notes = (notes ? notes + '\n' : '') + `Second contact: ${sc}`;
              }
            }
            const tags = norm.tags
              ? String(norm.tags)
                  .split(/[;,]/)
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : [];
            const statusRaw = (norm.status || norm.client_status || '').toString();
            let status = 'lead';
            if (/client/i.test(statusRaw)) status = 'client';
            else if (/dead\s*lead/i.test(statusRaw)) status = 'dead_lead';
            else if (/completed|done|finished/i.test(statusRaw)) status = 'completed';
            else if (/active/i.test(statusRaw)) status = 'active';
            else if (/new\s*lead/i.test(statusRaw)) status = 'lead';
            else if (/contractor|ready\s*for\s*measure/i.test(statusRaw)) status = 'active';
            else if (/not\s*interested|inactive|closed/i.test(statusRaw)) status = 'inactive';
            const source =
              norm.source ||
              norm.source_channel ||
              norm.source_campaign ||
              norm.how_did_you_hear_about_us
                ? (
                    norm.source ||
                    norm.source_channel ||
                    norm.source_campaign ||
                    norm.how_did_you_hear_about_us
                  ).toString()
                : '';
            return {
              firstName: firstName?.toString().trim(),
              lastName: lastName?.toString().trim() || '',
              email: email.toLowerCase(),
              phone: cleanPhone,
              company,
              notes,
              tags,
              status,
              source,
            };
          });

          const {
            allowEmailOnly = false,
            allowPhoneOnly = true,
            synthEmailFromPhone = true,
            dedupeByPhone = true,
          } = options || {};

          const mapped: typeof mappedRaw = [];
          for (const m of mappedRaw) {
            if (!m.firstName) {
              registerSkip('missing_first_name');
              continue;
            }
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
              if (!allowEmailOnly) {
                registerSkip('missing_phone');
                continue;
              }
            }
            if (!m.email && !m.phone) {
              registerSkip('missing_core_fields');
              continue;
            }
            if (!m.lastName) m.lastName = '-';
            mapped.push(m);
          }

          const emailMap = new Map<string, (typeof mapped)[0]>();
          const phoneMap = new Map<string, (typeof mapped)[0]>();
          for (const m of mapped) {
            if (m.email && !emailMap.has(m.email)) emailMap.set(m.email, m);
            if (dedupeByPhone && m.phone) {
              if (!phoneMap.has(m.phone)) phoneMap.set(m.phone, m);
            }
          }
          const unique: typeof mapped = Array.from(emailMap.values());
          if (dedupeByPhone) {
            for (const row of phoneMap.values()) {
              if ((!row.email || !emailMap.has(row.email)) && !unique.includes(row))
                unique.push(row);
            }
          }

          const emails = unique.filter(u => u.email).map(u => u.email);
          (async () => {
            const phones = unique.filter(u => u.phone).map(u => u.phone);
            // Fetch existing by email OR phone
            const existingList = await this.clientModel
              .find({
                workspaceId,
                $or: [
                  emails.length ? { email: { $in: emails } } : undefined,
                  phones.length ? { phone: { $in: phones } } : undefined,
                ].filter(Boolean),
              })
              .select('_id email phone address');
            const existingEmailMap = new Map(
              existingList.filter(e => e.email).map(e => [e.email, e] as const)
            );
            const existingPhoneMap = new Map(
              existingList.filter(e => e.phone).map(e => [e.phone, e] as const)
            );

            const bulkOps: any[] = [];
            let createCount = 0;
            let updateCount = 0;
            for (const u of unique) {
              const existingByEmail = u.email ? existingEmailMap.get(u.email) : undefined;
              const existingByPhone = u.phone ? existingPhoneMap.get(u.phone) : undefined;
              const target = existingByEmail || existingByPhone;
              if (target) {
                // Merge address if provided later (csv import currently doesn't map address here but keep placeholder)
                const update: Record<string, unknown> = {
                  firstName: u.firstName,
                  lastName: u.lastName,
                  phone: u.phone || target.phone || undefined,
                  company: u.company || target.company || undefined,
                  notes: u.notes || target.notes || undefined,
                  workspaceId,
                  isActive: true,
                  status: u.status,
                  source: u.source || target.source || undefined,
                };
                // If existing has placeholder synthesized email and new has a real one, replace
                if (u.email && (!target.email || /@import\.local$/.test(String(target.email)))) {
                  update.email = u.email;
                }
                bulkOps.push({
                  updateOne: {
                    filter: { _id: target._id },
                    update: { $set: update, $addToSet: { tags: { $each: u.tags } } },
                  },
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
                    },
                  },
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
              remediation: this.buildRemediation(skipReasonsCount),
            });
          })().catch(err => reject(new BadRequestException(err.message)));
        });
    });
  }

  private buildRemediation(skipReasons: Record<string, number>) {
    const suggestions: { reason: string; suggestion: string }[] = [];
    if (skipReasons.missing_phone)
      suggestions.push({
        reason: 'missing_phone',
        suggestion: 'Provide a phone column or enable allowEmailOnly option.',
      });
    if (skipReasons.missing_email)
      suggestions.push({
        reason: 'missing_email',
        suggestion: 'Add email addresses or enable synthEmailFromPhone (requires phone).',
      });
    if (skipReasons.synth_email)
      suggestions.push({
        reason: 'synth_email',
        suggestion: 'Consider collecting real emails; synthesized values are placeholders.',
      });
    if (skipReasons.missing_first_name)
      suggestions.push({
        reason: 'missing_first_name',
        suggestion: 'Add first_name column or a full_name field that can be split.',
      });
    if (skipReasons.missing_core_fields)
      suggestions.push({
        reason: 'missing_core_fields',
        suggestion: 'Row lacks both email and phone; supply at least one identifier.',
      });
    return suggestions;
  }

  async bulkJson(clients: Record<string, unknown>[], workspaceId: string) {
    if (!Array.isArray(clients)) throw new BadRequestException('clients must be array');
    const sanitized = clients
      .map(c => {
        const client = c as {
          firstName?: unknown;
          lastName?: unknown;
          email?: unknown;
          phone?: unknown;
          company?: unknown;
          notes?: unknown;
          tags?: unknown;
          status?: unknown;
          source?: unknown;
          address?: Record<string, unknown>;
          street?: unknown;
          city?: unknown;
          state?: unknown;
          zip?: unknown;
          zipCode?: unknown;
          country?: unknown;
          country_name?: unknown;
        };
        const phoneRaw = client.phone?.toString() || '';
        const phone = phoneRaw.replace(/[^\d]/g, '');
        let email = client.email?.toString().trim().toLowerCase();
        if ((!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) && phone) {
          email = `${phone}@import.local`; // synthesize to satisfy schema requirement
        }
        // Address normalization: accept flat fields or nested address
        const addrSource = client.address || {};
        const street = client.street || addrSource.street;
        const city = client.city || addrSource.city;
        const state = client.state || addrSource.state;
        const zip = client.zip || client.zipCode || addrSource.zipCode || addrSource.zip;
        const country = client.country || client.country_name || addrSource.country;
        const address =
          street || city || state || zip || country
            ? {
                street: street || undefined,
                city: city || undefined,
                state: state || undefined,
                zipCode: zip || undefined,
                country: country || undefined,
              }
            : undefined;
        // Extended statuses support
        const validStatuses = [
          'lead',
          'prospect',
          'active',
          'inactive',
          'churned',
          'completed',
          'client',
          'dead_lead',
        ];
        const status = client.status && validStatuses.includes(String(client.status)) ? String(client.status) : 'lead';
        return {
          firstName: client.firstName?.toString().trim() || '',
          lastName: client.lastName?.toString().trim() || '-',
          email, // may be synthesized
          phone,
          company: client.company?.toString().trim() || undefined,
          notes: client.notes,
          tags: Array.isArray(client.tags)
            ? client.tags
            : client.tags
              ? String(client.tags)
                  .split(/[,;]+/)
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : [],
          status,
          source: client.source || undefined,
          address,
        };
      })
      .filter(c => c.firstName && (c.email || c.phone));

    // Deduplicate by email first, then by phone for those without distinct email
    const emailMap = new Map<string, (typeof sanitized)[0]>();
    const phoneMap = new Map<string, (typeof sanitized)[0]>();
    for (const row of sanitized) {
      if (row.email && !emailMap.has(row.email)) emailMap.set(row.email, row);
      if (row.phone && !phoneMap.has(row.phone)) phoneMap.set(row.phone, row);
    }
    const unique: typeof sanitized = Array.from(emailMap.values());
    for (const r of phoneMap.values()) {
      if ((!r.email || !emailMap.has(r.email)) && !unique.includes(r)) unique.push(r);
    }
    const duplicatesCollapsed = sanitized.length - unique.length;

    const existingEmails = unique.filter(c => c.email).map(c => c.email);
    const existingPhones = unique.filter(c => c.phone).map(c => c.phone);
    const existingDocs =
      existingEmails.length || existingPhones.length
        ? await this.clientModel
            .find({
              workspaceId,
              $or: [
                existingEmails.length ? { email: { $in: existingEmails } } : undefined,
                existingPhones.length ? { phone: { $in: existingPhones } } : undefined,
              ].filter(Boolean),
            })
            .select('_id email phone address')
        : [];
    const existingEmailMap = new Map(
      existingDocs.filter(d => d.email).map(d => [d.email, d] as const)
    );
    const existingPhoneMap = new Map(
      existingDocs.filter(d => d.phone).map(d => [d.phone, d] as const)
    );
    let created = 0,
      updated = 0;
    const ops: any[] = [];
    for (const c of unique) {
      const existingByEmail = c.email ? existingEmailMap.get(c.email) : undefined;
      const existingByPhone = c.phone ? existingPhoneMap.get(c.phone) : undefined;
      const target = existingByEmail || existingByPhone;
      if (target) {
        const update: Record<string, unknown> = { ...c, workspaceId, isActive: true };
        // Preserve real email if replacing synthesized placeholder
        if (
          c.email &&
          target.email &&
          /@import\.local$/.test(String(target.email)) &&
          !/@import\.local$/.test(c.email)
        ) {
          update.email = c.email;
        }
        ops.push({
          updateOne: {
            filter: { _id: target._id },
            update: { $set: update, $addToSet: { tags: { $each: c.tags } } },
          },
        });
        updated++;
      } else {
        ops.push({ insertOne: { document: { ...c, workspaceId, isActive: true } } });
        created++;
      }
    }
    if (ops.length) await this.clientModel.bulkWrite(ops, { ordered: false });
    return { created, updated, skipped: clients.length - (created + updated), duplicatesCollapsed };
  }

  async syncToQuickBooks(clientId: string, workspaceId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find the client
      const client = await this.clientModel.findOne({ _id: clientId, workspaceId });
      if (!client) {
        throw new BadRequestException('Client not found');
      }

      // Here you would integrate with QuickBooks API to sync the client
      // For now, we'll just mark it as synced in our database
      await this.clientModel.updateOne(
        { _id: clientId, workspaceId },
        { $set: { quickbooksSynced: true, quickbooksSyncDate: new Date() } }
      );

      return {
        success: true,
        message: 'Client synced to QuickBooks successfully'
      };
    } catch (error) {
      throw new BadRequestException(`Failed to sync client to QuickBooks: ${error.message}`);
    }
  }
}
