import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShareLink, ShareLinkDocument } from './schemas/share-link.schema';
import { CreateShareLinkDto } from './dto/create-share-link.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ShareLinksService {
  constructor(
    @InjectModel(ShareLink.name) private shareModel: Model<ShareLinkDocument>,
    private jwt: JwtService
  ) {}

  async create(dto: CreateShareLinkDto, workspaceId: string, userId: string) {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 12) : undefined;
    const link = new this.shareModel({
      token,
      type: dto.type,
      targetId: dto.targetId,
      workspaceId,
      permissions: dto.permissions,
      expiresAt,
      maxUses: dto.maxUses || (dto.singleUse ? 1 : 100),
      passwordHash,
      createdByUserId: userId,
      metadata: dto.metadata,
      singleUse: dto.singleUse || false,
    });
    await link.save();
    return { token, url: `${process.env.FRONTEND_URL || ''}/share/${token}` };
  }

  async claim(token: string, password?: string) {
    const link = await this.shareModel.findOne({ token });
    if (!link) throw new NotFoundException('Invalid share link');
    if (link.revokedAt) throw new BadRequestException('Share link revoked');
    if (link.expiresAt && link.expiresAt < new Date())
      throw new BadRequestException('Share link expired');
    if (link.singleUse && link.usedCount >= 1)
      throw new ForbiddenException('Share link already used');
    if (link.maxUses && link.usedCount >= link.maxUses)
      throw new ForbiddenException('Usage limit reached');
    if (link.passwordHash) {
      const ok = await bcrypt.compare(password || '', link.passwordHash);
      if (!ok) throw new ForbiddenException('Invalid password');
    }
    // optimistic increment
    link.usedCount += 1;
    await link.save();
    const payload = {
      sub: `share:${link._id}`,
      workspaceId: link.workspaceId,
      shareId: link._id.toString(),
      targetId: link.targetId,
      perms: link.permissions,
      scope: 'share',
    };
    const shareToken = this.jwt.sign(payload, { expiresIn: '2h' });
    return {
      token: shareToken,
      permissions: link.permissions,
      targetId: link.targetId,
      type: link.type,
    };
  }

  async revoke(token: string, workspaceId: string) {
    const link = await this.shareModel.findOne({ token, workspaceId });
    if (!link) throw new NotFoundException('Not found');
    link.revokedAt = new Date();
    await link.save();
    return { revoked: true };
  }

  list(workspaceId: string) {
    return this.shareModel.find({ workspaceId }).sort({ createdAt: -1 });
  }
}
