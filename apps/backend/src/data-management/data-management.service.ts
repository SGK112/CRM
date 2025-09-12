import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
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

interface BulkActionResult {
  category: string;
  action?: string;
  affectedCount: number;
  success: boolean;
  error?: string;
}

@Injectable()
export class DataManagementService {
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
  ) {}

  private getModelForCategory(category: string): Model<Document> | null {
    const modelMap: Record<string, Model<Document>> = {
      'notifications': this.notificationModel,
      'contacts': this.clientModel,
      'invoices': this.invoiceModel,
      'estimates': this.estimateModel,
      'appointments': this.appointmentModel,
      'projects': this.projectModel,
      'media': this.mediaModel,
      'designs': this.designModel,
      'employees': this.employeeModel,
    };

    return modelMap[category] || null;
  }

  async executeBulkAction(
    action: 'delete' | 'archive' | 'organize',
    categories: string[],
    workspaceId: string,
  ): Promise<{ success: boolean; message: string; results: BulkActionResult[] }> {
    const results: BulkActionResult[] = [];

    try {
      for (const category of categories) {
        const model = this.getModelForCategory(category);
        if (!model) {
          results.push({
            category,
            error: 'Unknown category',
            affectedCount: 0,
            success: false,
          });
          continue;
        }

        const query: Record<string, unknown> = {};
        
        // Build query for workspace-specific data
        if (category === 'notifications') {
          query.workspaceId = workspaceId;
        } else if (category === 'contacts') {
          query.workspaceId = workspaceId;
        } else {
          // Most models have workspaceId field
          query.workspaceId = workspaceId;
        }

        let affectedCount = 0;

        switch (action) {
          case 'delete': {
            const deleteResult = await model.deleteMany(query);
            affectedCount = deleteResult.deletedCount || 0;
            break;
          }

          case 'archive': {
            // For archive, we set an archived flag instead of deleting
            const archiveResult = await model.updateMany(
              query,
              { $set: { archived: true, archivedAt: new Date() } }
            );
            affectedCount = archiveResult.modifiedCount || 0;
            break;
          }

          case 'organize': {
            // For organize, we could add tags or categories
            const organizeResult = await model.updateMany(
              query,
              { $set: { organized: true, organizedAt: new Date() } }
            );
            affectedCount = organizeResult.modifiedCount || 0;
            break;
          }
        }

        results.push({
          category,
          action,
          affectedCount,
          success: true,
        });
      }

      return {
        success: true,
        message: `Successfully ${action}d ${categories.length} categories`,
        results,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to ${action} data: ${error.message}`,
        results,
      };
    }
  }

  async exportData(
    categories: string[],
    format: 'json' | 'csv',
    workspaceId: string
  ): Promise<{ success: boolean; data?: Record<string, Document[]>; message: string }> {
    try {
      const exportData: Record<string, Document[]> = {};

      for (const category of categories) {
        const model = this.getModelForCategory(category);
        if (!model) continue;

        const query = { workspaceId };
        const data = await model.find(query).lean();
        exportData[category] = data;
      }

      return {
        success: true,
        data: exportData,
        message: 'Data exported successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to export data: ${error.message}`,
      };
    }
  }

  async archiveData(
    categories: string[],
    workspaceId: string
  ): Promise<{ success: boolean; message: string; results: BulkActionResult[] }> {
    return this.executeBulkAction('archive', categories, workspaceId);
  }

  async organizeData(
    categories: string[],
    workspaceId: string
  ): Promise<{ success: boolean; message: string; results: BulkActionResult[] }> {
    return this.executeBulkAction('organize', categories, workspaceId);
  }

  async resetWorkspaceData(
    workspaceId: string,
  ): Promise<{ success: boolean; message: string; results: BulkActionResult[] }> {
    const categories = [
      'notifications',
      'contacts',
      'invoices',
      'estimates',
      'appointments',
      'projects',
      'media',
      'designs',
      'employees',
    ];

    return this.executeBulkAction('delete', categories, workspaceId);
  }

  async getDataStats(workspaceId: string): Promise<Record<string, { total: number; size: number }>> {
    const stats: Record<string, { total: number; size: number }> = {};

    const categories = [
      'notifications',
      'contacts',
      'invoices',
      'estimates',
      'appointments',
      'projects',
      'media',
      'designs',
    ];

    for (const category of categories) {
      const model = this.getModelForCategory(category);
      if (model) {
        const count = await model.countDocuments({ workspaceId });
        // Estimate size - this is a rough calculation
        const avgDocSize = 1024; // 1KB average per document
        stats[category] = {
          total: count,
          size: count * avgDocSize,
        };
      }
    }

    return stats;
  }
}
