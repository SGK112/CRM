import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Workspace, WorkspaceDocument } from './schemas/workspace.schema';

// Simple seat limit map (later dynamic via plans)
const PLAN_SEAT_LIMIT: Record<string, number> = {
  free: 3,
  starter: 10,
  growth: 25,
};

@Injectable()
export class WorkspaceUsageService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>
  ) {}

  async seatUsage(workspaceId: string) {
    const users = await this.userModel.find({ workspaceId, isActive: true });
    const used = users.length;
    // assume all users share plan of first user
    const plan = users[0]?.subscriptionPlan || 'free';
    const limit = PLAN_SEAT_LIMIT[plan] || PLAN_SEAT_LIMIT.free;
    return { used, limit, plan };
  }

  async getSettings(workspaceId: string): Promise<WorkspaceDocument | null> {
    return await this.workspaceModel.findOne({ workspaceId });
  }

  async updateSettings(workspaceId: string, body: any): Promise<WorkspaceDocument | null> {
    const allowed: (keyof Workspace)[] = [
      'name',
      'brandingColor',
      'logoUrl',
      'personalizationEnabled',
    ];
    const update: Partial<Workspace> = {};
    for (const k of allowed)
      if (Object.prototype.hasOwnProperty.call(body, k)) (update as any)[k] = body[k];
    const doc = await this.workspaceModel.findOneAndUpdate({ workspaceId }, update, { new: true });
    return doc;
  }
}
