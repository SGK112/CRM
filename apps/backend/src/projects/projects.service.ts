import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto, workspaceId: string): Promise<Project> {
    const project = new this.projectModel({
      ...createProjectDto,
      workspaceId,
    });
    return project.save();
  }

  async findAll(workspaceId: string): Promise<Project[]> {
    return this.projectModel.find({ workspaceId }).exec();
  }

  async findOne(id: string, workspaceId: string): Promise<Project> {
    return this.projectModel.findOne({ _id: id, workspaceId }).exec();
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, workspaceId: string): Promise<Project> {
    return this.projectModel.findOneAndUpdate(
      { _id: id, workspaceId },
      updateProjectDto,
      { new: true }
    ).exec();
  }

  async remove(id: string, workspaceId: string): Promise<any> {
    return this.projectModel.findOneAndDelete({ _id: id, workspaceId }).exec();
  }

  async findByStatus(status: string, workspaceId: string): Promise<Project[]> {
    return this.projectModel.find({ status, workspaceId }).exec();
  }

  async findByClientId(clientId: string, workspaceId: string): Promise<Project[]> {
    return this.projectModel.find({ clientId, workspaceId }).exec();
  }
}
