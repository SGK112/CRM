import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspaceUsageService } from './workspace-usage.service';
import { WorkspaceController } from './workspace.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Workspace, WorkspaceSchema } from './schemas/workspace.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Workspace.name, schema: WorkspaceSchema }
  ])],
  providers: [WorkspaceUsageService],
  controllers: [WorkspaceController],
  exports: [WorkspaceUsageService],
})
export class WorkspaceModule {}
