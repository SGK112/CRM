import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project, ProjectSchema } from './schemas/project.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]), BillingModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
