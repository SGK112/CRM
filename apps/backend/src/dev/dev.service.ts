import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class DevService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async setupSuperAdminAccount(email: string) {
    // Update the user with all necessary permissions and access
    const updatedUser = await this.userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          role: 'owner',
          subscriptionPlan: 'growth',
          subscriptionStatus: 'active',
          trialEndsAt: null,
          isActive: true,
          isEmailVerified: true,
        }
      },
      { new: true, upsert: false }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    // Create a default workspace if none exists
    if (!updatedUser.workspaceId) {
      // This would need workspace service integration
      // For now, we'll just ensure the user has proper access
    }

    return {
      success: true,
      message: 'Super admin account setup completed',
      user: {
        email: updatedUser.email,
        role: updatedUser.role,
        subscriptionPlan: updatedUser.subscriptionPlan,
        subscriptionStatus: updatedUser.subscriptionStatus,
        isActive: updatedUser.isActive,
        isEmailVerified: updatedUser.isEmailVerified,
      }
    };
  }

  async verifyUserAccess(user: any) {
    const fullUser = await this.userModel.findById(user.sub).lean();
    
    return {
      userId: fullUser._id,
      email: fullUser.email,
      role: fullUser.role,
      subscriptionPlan: fullUser.subscriptionPlan,
      subscriptionStatus: fullUser.subscriptionStatus,
      isActive: fullUser.isActive,
      isEmailVerified: fullUser.isEmailVerified,
      hasEstimateAccess: true,
      hasAiAccess: fullUser.role === 'owner' || fullUser.role === 'admin',
      hasDocumentSharing: fullUser.role === 'owner' || fullUser.role === 'admin',
      hasClientPortal: fullUser.role === 'owner' || fullUser.role === 'admin',
      hasBillingAccess: fullUser.role === 'owner' || fullUser.role === 'admin',
      workspaceAccess: fullUser.workspaceId ? 'full' : 'limited',
      workspaceId: fullUser.workspaceId,
    };
  }
}
