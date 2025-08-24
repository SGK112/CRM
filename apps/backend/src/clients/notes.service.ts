import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';

interface CreateNoteDto {
  workspaceId: string;
  clientId: string;
  projectId?: string;
  appointmentId?: string;
  voiceCallId?: string;
  estimateId?: string;
  invoiceId?: string;
  content: string;
  type: Note['type'];
  createdBy?: string;
  tags?: string[];
  priority?: Note['priority'];
  isPrivate?: boolean;
  metadata?: Note['metadata'];
}

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
  ) {}

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const note = new this.noteModel({
      ...createNoteDto,
      tags: createNoteDto.tags || [],
      priority: createNoteDto.priority || 'medium',
      isPrivate: createNoteDto.isPrivate || false,
    });

    return note.save();
  }

  async findByClient(workspaceId: string, clientId: string, filters?: {
    type?: string;
    tags?: string[];
    priority?: string;
    includePrivate?: boolean;
  }): Promise<Note[]> {
    const query: any = { workspaceId, clientId };

    if (filters) {
      if (filters.type) query.type = filters.type;
      if (filters.priority) query.priority = filters.priority;
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
      if (!filters.includePrivate) {
        query.isPrivate = { $ne: true };
      }
    } else {
      query.isPrivate = { $ne: true };
    }

    return this.noteModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findByVoiceCall(voiceCallId: string): Promise<Note[]> {
    return this.noteModel.find({ voiceCallId }).sort({ createdAt: -1 }).exec();
  }

  async createFromVoiceCall(callData: {
    workspaceId: string;
    clientId: string;
    voiceCallId: string;
    content: string;
    callDuration?: number;
    callOutcome?: string;
    nextAction?: string;
    followUpDate?: Date;
    sentiment?: 'positive' | 'neutral' | 'negative';
    actionItems?: string[];
  }): Promise<Note> {
    return this.create({
      workspaceId: callData.workspaceId,
      clientId: callData.clientId,
      voiceCallId: callData.voiceCallId,
      content: callData.content,
      type: 'voice_agent',
      createdBy: 'voice_agent',
      tags: ['voice_call', 'automated'],
      priority: callData.nextAction ? 'high' : 'medium',
      metadata: {
        callDuration: callData.callDuration,
        callOutcome: callData.callOutcome,
        nextAction: callData.nextAction,
        followUpDate: callData.followUpDate,
        sentiment: callData.sentiment,
        actionItems: callData.actionItems,
      }
    });
  }

  async addFollowUpNote(data: {
    workspaceId: string;
    clientId: string;
    content: string;
    followUpDate?: Date;
    estimateId?: string;
    invoiceId?: string;
    createdBy?: string;
  }): Promise<Note> {
    return this.create({
      workspaceId: data.workspaceId,
      clientId: data.clientId,
      estimateId: data.estimateId,
      invoiceId: data.invoiceId,
      content: data.content,
      type: 'follow_up',
      createdBy: data.createdBy || 'voice_agent',
      tags: ['follow_up'],
      priority: 'high',
      metadata: {
        followUpDate: data.followUpDate,
        nextAction: 'Contact client for follow-up'
      }
    });
  }

  async searchNotes(workspaceId: string, searchTerm: string, filters?: {
    clientId?: string;
    type?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Note[]> {
    const query: any = { 
      workspaceId,
      $text: { $search: searchTerm }
    };

    if (filters) {
      if (filters.clientId) query.clientId = filters.clientId;
      if (filters.type) query.type = filters.type;
      
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }
    }

    return this.noteModel.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .exec();
  }

  async getRecentNotes(workspaceId: string, limit: number = 10): Promise<Note[]> {
    return this.noteModel.find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getActionItems(workspaceId: string): Promise<Note[]> {
    return this.noteModel.find({
      workspaceId,
      'metadata.actionItems': { $exists: true, $ne: [] },
      priority: { $in: ['medium', 'high'] }
    }).sort({ createdAt: -1 }).exec();
  }

  async markAsPrivate(noteId: string): Promise<Note> {
    return this.noteModel.findByIdAndUpdate(
      noteId,
      { isPrivate: true },
      { new: true }
    ).exec();
  }

  async addTags(noteId: string, tags: string[]): Promise<Note> {
    return this.noteModel.findByIdAndUpdate(
      noteId,
      { $addToSet: { tags: { $each: tags } } },
      { new: true }
    ).exec();
  }
}
