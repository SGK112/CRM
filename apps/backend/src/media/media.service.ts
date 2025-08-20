import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media, MediaDocument } from './schemas/media.schema';
import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';
import { CreateMediaRecordDto } from './dto/create-media.dto';

interface SignResult { timestamp: number; signature: string; apiKey: string; cloudName: string; folder?: string; }

@Injectable()
export class MediaService {
  private cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  private apiKey = process.env.CLOUDINARY_API_KEY || '';
  private apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  constructor(@InjectModel(Media.name) private mediaModel: Model<MediaDocument>) {}

  async signUpload(workspaceId: string, userId: string, params: { folder?: string; projectId?: string; access?: string; tags?: string[]; mimeType?: string; }) : Promise<SignResult> {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) throw new BadRequestException('Cloudinary not configured');
    const timestamp = Math.floor(Date.now()/1000);
    // Basic folder isolation per workspace
    const folder = params.folder || `ws_${workspaceId}`;
    // Access mapping: workspace/restricted => set type=authenticated (upload preset handles); we'll just sign public_id path.
    const toSign: Record<string,string|number> = { timestamp, folder };
    const signatureBase = Object.keys(toSign).sort().map(k=>`${k}=${toSign[k]}`).join('&') + this.apiSecret;
    const signature = crypto.createHash('sha1').update(signatureBase).digest('hex');
    return { timestamp, signature, apiKey: this.apiKey, cloudName: this.cloudName, folder };
  }

  async createRecord(workspaceId: string, userId: string, dto: Partial<CreateMediaRecordDto>) {
    const hash = dto.hash || uuid();
    const doc = new this.mediaModel({
      workspaceId,
      projectId: dto.projectId,
      uploaderUserId: userId,
      provider: dto.provider || 'cloudinary',
      originalFilename: dto.originalFilename || 'file',
      mimeType: dto.mimeType || 'application/octet-stream',
      bytes: dto.bytes || 0,
      width: dto.width,
      height: dto.height,
      hash,
      publicId: dto.publicId,
      access: dto.access || 'workspace',
      variants: dto['variants'] || [],
      tags: dto.tags || [],
    });
    await doc.save();
    return doc;
  }

  list(workspaceId: string, projectId?: string) {
    const q: any = { workspaceId, deleted: false };
    if (projectId) q.projectId = projectId;
    return this.mediaModel.find(q).sort({ createdAt: -1 });
  }

  async get(workspaceId: string, id: string) {
    return this.mediaModel.findOne({ _id: id, workspaceId, deleted: false });
  }
}
