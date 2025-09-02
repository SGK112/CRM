import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiTokenBalance, AiTokenBalanceDocument } from './schemas/ai-token-balance.schema';

@Injectable()
export class AiTokensService {
  constructor(@InjectModel(AiTokenBalance.name) private model: Model<AiTokenBalanceDocument>) {}

  private async getOrCreate(workspaceId: string) {
    let doc = await this.model.findOne({ workspaceId });
    if (!doc) {
      doc = new this.model({ workspaceId, purchased: 0, consumed: 0, bonus: 0, reserved: 0 });
      await doc.save();
    }
    return doc;
  }

  async balance(workspaceId: string) {
    const doc = await this.getOrCreate(workspaceId);
    const available = doc.purchased + doc.bonus - doc.consumed - doc.reserved;
    return {
      available,
      purchased: doc.purchased,
      consumed: doc.consumed,
      bonus: doc.bonus,
      reserved: doc.reserved,
    };
  }

  async purchase(workspaceId: string, quantity: number, _paymentIntentId?: string) {
    if (quantity <= 0) throw new BadRequestException('Quantity must be positive');
    const doc = await this.getOrCreate(workspaceId);
    doc.purchased += quantity;
    await doc.save();
    return this.balance(workspaceId);
  }

  async consume(
    workspaceId: string,
    quantity: number,
    _meta?: { reason?: string; referenceId?: string }
  ) {
    if (quantity <= 0) throw new BadRequestException('Quantity must be positive');
    const doc = await this.getOrCreate(workspaceId);
    const available = doc.purchased + doc.bonus - doc.consumed - doc.reserved;
    if (available < quantity) throw new ForbiddenException('Insufficient AI tokens');
    doc.consumed += quantity;
    await doc.save();
    return this.balance(workspaceId);
  }
}
