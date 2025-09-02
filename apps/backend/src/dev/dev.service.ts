import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Client } from '../clients/schemas/client.schema';
import { Project } from '../projects/schemas/project.schema';
import { Appointment } from '../appointments/schemas/appointment.schema';
import { Estimate } from '../estimates/schemas/estimate.schema';
import { Invoice } from '../invoices/schemas/invoice.schema';
import { Notification } from '../notifications/schemas/notification.schema';
import { Media } from '../media/schemas/media.schema';
import { Design } from '../designs/schemas/design.schema';
import { DesignRevision } from '../designs/schemas/design-revision.schema';
import { Employee } from '../hr/schemas/employee.schema';
import { Invitation } from '../invitations/schemas/invitation.schema';
import { ShareLink } from '../share-links/schemas/share-link.schema';
import { VoiceCall } from '../voice-agent/schemas/voice-call.schema';
import { AiTokenBalance } from '../ai-tokens/schemas/ai-token-balance.schema';

@Injectable()
export class DevService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(Estimate.name) private estimateModel: Model<Estimate>,
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(Media.name) private mediaModel: Model<Media>,
    @InjectModel(Design.name) private designModel: Model<Design>,
    @InjectModel(DesignRevision.name) private designRevisionModel: Model<DesignRevision>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Invitation.name) private invitationModel: Model<Invitation>,
    @InjectModel(ShareLink.name) private shareLinkModel: Model<ShareLink>,
    @InjectModel(VoiceCall.name) private voiceCallModel: Model<VoiceCall>,
    @InjectModel(AiTokenBalance.name) private aiTokenBalanceModel: Model<AiTokenBalance>
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
        },
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
      },
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

  async resetAllData(adminEmail: string) {
    const resetStartTime = new Date();
    const results = [];

    try {
      // Get admin user ID to preserve admin account
      const adminUser = await this.userModel.findOne({ email: adminEmail }).lean();
      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      // Delete all data except admin user
      const collections = [
        { name: 'Clients', model: this.clientModel },
        { name: 'Projects', model: this.projectModel },
        { name: 'Appointments', model: this.appointmentModel },
        { name: 'Estimates', model: this.estimateModel },
        { name: 'Invoices', model: this.invoiceModel },
        { name: 'Notifications', model: this.notificationModel },
        { name: 'Media', model: this.mediaModel },
        { name: 'Designs', model: this.designModel },
        { name: 'Design Revisions', model: this.designRevisionModel },
        { name: 'Employees', model: this.employeeModel },
        { name: 'Invitations', model: this.invitationModel },
        { name: 'Share Links', model: this.shareLinkModel },
        { name: 'Voice Calls', model: this.voiceCallModel },
        { name: 'AI Token Balances', model: this.aiTokenBalanceModel },
      ];

      // Delete all non-admin users
      const deletedUsersResult = await this.userModel.deleteMany({
        _id: { $ne: adminUser._id },
      });
      results.push({
        collection: 'Users (except admin)',
        deletedCount: deletedUsersResult.deletedCount,
      });

      // Delete all other collections completely
      for (const collection of collections) {
        try {
          const result = await (collection.model as any).deleteMany({});
          results.push({
            collection: collection.name,
            deletedCount: result.deletedCount,
          });
        } catch (error) {
          results.push({
            collection: collection.name,
            error: error.message,
            deletedCount: 0,
          });
        }
      }

      const resetEndTime = new Date();
      const duration = resetEndTime.getTime() - resetStartTime.getTime();

      return {
        success: true,
        message: 'All data has been reset successfully',
        adminEmail,
        preservedAdminUser: {
          id: adminUser._id,
          email: adminUser.email,
          role: adminUser.role,
        },
        results,
        duration: `${duration}ms`,
        resetAt: resetEndTime.toISOString(),
        totalItemsDeleted: results.reduce((sum, r) => sum + (r.deletedCount || 0), 0),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to reset data',
        error: error.message,
        results,
        resetAt: new Date().toISOString(),
      };
    }
  }
}
