import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Invitation, InvitationDocument } from './schemas/invitation.schema';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/create-invitation.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Workspace, WorkspaceDocument } from '../workspace/schemas/workspace.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(Invitation.name) private invitationModel: Model<InvitationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>
  ) {}

  async create(dto: CreateInvitationDto, workspaceId: string, createdBy: string) {
    // Seat limit pre-check
    const ws = await this.workspaceModel.findOne({ workspaceId });
    if (ws) {
      const seatCount = await this.userModel.countDocuments({ workspaceId, isActive: true });
      if (seatCount >= ws.seatLimit) throw new ForbiddenException('Seat limit reached');
    }
    const existing = await this.userModel.findOne({ email: dto.email, workspaceId });
    if (existing) throw new BadRequestException('User already in workspace');
    const activeInvite = await this.invitationModel.findOne({
      email: dto.email,
      workspaceId,
      acceptedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
    if (activeInvite) return activeInvite; // idempotent
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (dto.ttlHours || 168) * 3600 * 1000);
    const inv = new this.invitationModel({
      workspaceId,
      email: dto.email.toLowerCase(),
      role: dto.role,
      token,
      expiresAt,
      createdBy,
    });
    await inv.save();
    return inv;
  }

  async list(workspaceId: string) {
    return this.invitationModel.find({ workspaceId }).sort({ createdAt: -1 });
  }

  async revoke(id: string, workspaceId: string) {
    const inv = await this.invitationModel.findOne({ _id: id, workspaceId });
    if (!inv) throw new NotFoundException('Invitation not found');
    await inv.deleteOne();
    return { success: true };
  }

  async accept(dto: AcceptInvitationDto) {
    const inv = await this.invitationModel.findOne({ token: dto.token });
    if (!inv) throw new NotFoundException('Invalid token');
    if (inv.acceptedAt) throw new BadRequestException('Already accepted');
    if (inv.expiresAt < new Date()) throw new BadRequestException('Expired');
    // Find or create user (simplified: require existing user for now)
    let user = await this.userModel.findOne({ email: inv.email, workspaceId: inv.workspaceId });
    if (user) throw new BadRequestException('User already joined');

    // Check if a user exists globally with same email (multi-workspace membership) -> clone minimal fields
    const existingGlobal = await this.userModel.findOne({ email: inv.email });
    // Re-check seat availability at acceptance time
    const ws = await this.workspaceModel.findOne({ workspaceId: inv.workspaceId });
    if (ws) {
      const seatCount = await this.userModel.countDocuments({
        workspaceId: inv.workspaceId,
        isActive: true,
      });
      if (seatCount >= ws.seatLimit) throw new ForbiddenException('Seat limit reached');
    }
    if (existingGlobal) {
      // Create new membership doc (same credentials but new workspace)
      user = new this.userModel({
        email: existingGlobal.email,
        password: existingGlobal.password, // hashed
        firstName: existingGlobal.firstName,
        lastName: existingGlobal.lastName,
        role: inv.role,
        workspaceId: inv.workspaceId,
        isEmailVerified: existingGlobal.isEmailVerified,
        isActive: true,
      });
    } else {
      // Require password presence else reject (lightweight for now)
      if (!dto.password) throw new BadRequestException('Password required for new user');
      const hashed = await bcrypt.hash(dto.password, 12);
      user = new this.userModel({
        email: inv.email,
        password: hashed,
        firstName: dto.firstName || 'New',
        lastName: dto.lastName || 'User',
        role: inv.role,
        workspaceId: inv.workspaceId,
        isEmailVerified: true,
        isActive: true,
      });
    }
    await user.save();
    inv.acceptedAt = new Date();
    await inv.save();
    return { success: true };
  }
}
