import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Design, DesignDocument } from './schemas/design.schema';
import { DesignTemplate, DesignTemplateDocument } from './schemas/design-template.schema';
import { DesignRevision, DesignRevisionDocument } from './schemas/design-revision.schema';

@Injectable()
export class DesignsService {
  constructor(
    @InjectModel(Design.name) private designModel: Model<DesignDocument>,
    @InjectModel(DesignTemplate.name) private templateModel: Model<DesignTemplateDocument>,
    @InjectModel(DesignRevision.name) private revisionModel: Model<DesignRevisionDocument>
  ) {}

  createTemplate(dto: any, workspaceId: string) {
    return this.templateModel.create({ ...dto, workspaceId });
  }
  listTemplates(workspaceId: string, query: any) {
    const filter: any = { workspaceId, isActive: true };
    if (query.category && query.category !== 'all') filter.category = query.category;
    if (query.type && query.type !== 'all') filter.type = query.type;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    return this.templateModel.find(filter).sort({ updatedAt: -1 }).limit(200).exec();
  }
  async getTemplate(id: string, workspaceId: string) {
    const t = await this.templateModel.findOne({ _id: id, workspaceId, isActive: true });
    if (!t) throw new NotFoundException('Template not found');
    return t;
  }
  updateTemplate(id: string, dto: any, workspaceId: string) {
    return this.templateModel.findOneAndUpdate({ _id: id, workspaceId }, dto, { new: true });
  }
  deleteTemplate(id: string, workspaceId: string) {
    return this.templateModel.findOneAndUpdate(
      { _id: id, workspaceId },
      { isActive: false },
      { new: true }
    );
  }

  async createDesign(dto: any, user: any) {
    const { templateId, title, baseData: directBaseData } = dto;
    let baseData: any = directBaseData || {};
    if (templateId) {
      const template = await this.templateModel.findOne({
        _id: templateId,
        workspaceId: user.workspaceId,
        isActive: true,
      });
      if (!template) throw new BadRequestException('Invalid template');
      // Merge template baseData over provided directBaseData only if not present
      baseData = { ...(template.baseData || {}), ...baseData };
      await this.templateModel.updateOne(
        { _id: templateId },
        { $inc: { usesCount: 1 }, lastUsedAt: new Date() }
      );
    }
    const design = await this.designModel.create({
      title: title || 'Untitled Design',
      templateId,
      ownerId: user.userId || user.sub,
      workspaceId: user.workspaceId,
      status: 'draft',
      tags: [],
      collaborators: [],
    });
    const revision = await this.revisionModel.create({
      designId: design._id,
      index: 1,
      canvasData: baseData,
      autosave: false,
      authorId: user.userId || user.sub,
      workspaceId: user.workspaceId,
    });
    design.currentRevisionId = revision._id.toString();
    await design.save();
    return { design, revision };
  }

  listDesigns(workspaceId: string, query: any, userId: string) {
    const filter: any = { workspaceId, isActive: true };
    if (query.status) filter.status = query.status;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };
    if (query.mine === '1') filter.ownerId = userId;
    return this.designModel.find(filter).sort({ updatedAt: -1 }).limit(200).exec();
  }

  async getDesign(id: string, workspaceId: string) {
    const d = await this.designModel.findOne({ _id: id, workspaceId, isActive: true });
    if (!d) throw new NotFoundException('Design not found');
    const revision = d.currentRevisionId
      ? await this.revisionModel.findById(d.currentRevisionId)
      : null;
    return { design: d, revision };
  }

  updateDesign(id: string, dto: any, workspaceId: string) {
    return this.designModel.findOneAndUpdate({ _id: id, workspaceId }, dto, { new: true });
  }
  archiveDesign(id: string, workspaceId: string) {
    return this.designModel.findOneAndUpdate(
      { _id: id, workspaceId },
      { isActive: false, status: 'archived' },
      { new: true }
    );
  }

  async createRevision(designId: string, dto: any, user: any) {
    const design = await this.designModel.findOne({
      _id: designId,
      workspaceId: user.workspaceId,
      isActive: true,
    });
    if (!design) throw new NotFoundException('Design not found');
    const latest = await this.revisionModel.find({ designId }).sort({ index: -1 }).limit(1);
    const nextIndex = latest.length ? latest[0].index + 1 : 1;
    const revision = await this.revisionModel.create({
      designId,
      index: nextIndex,
      canvasData: dto.canvasData || {},
      autosave: !!dto.autosave,
      authorId: user.userId || user.sub,
      workspaceId: user.workspaceId,
    });
    if (!dto.autosave) {
      await this.designModel.updateOne(
        { _id: designId },
        { currentRevisionId: revision._id, updatedAt: new Date() }
      );
    } else {
      await this.designModel.updateOne({ _id: designId }, { currentRevisionId: revision._id });
      const autosaves = await this.revisionModel
        .find({ designId, autosave: true })
        .sort({ createdAt: -1 })
        .skip(10);
      const pruneIds = autosaves.map(a => a._id);
      if (pruneIds.length) await this.revisionModel.deleteMany({ _id: { $in: pruneIds } });
    }
    return revision;
  }

  listRevisions(designId: string, workspaceId: string) {
    return this.revisionModel.find({ designId, workspaceId }).sort({ index: -1 }).limit(100).exec();
  }
  async getRevision(designId: string, revId: string, workspaceId: string) {
    const rev = await this.revisionModel.findOne({ _id: revId, designId, workspaceId });
    if (!rev) throw new NotFoundException('Revision not found');
    return rev;
  }
  async restoreRevision(designId: string, revId: string, user: any) {
    const rev = await this.getRevision(designId, revId, user.workspaceId);
    return this.createRevision(designId, { canvasData: rev.canvasData, autosave: false }, user);
  }
}
