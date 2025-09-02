import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';
import { Design, DesignSchema } from './schemas/design.schema';
import { DesignTemplate, DesignTemplateSchema } from './schemas/design-template.schema';
import { DesignRevision, DesignRevisionSchema } from './schemas/design-revision.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Design.name, schema: DesignSchema },
      { name: DesignTemplate.name, schema: DesignTemplateSchema },
      { name: DesignRevision.name, schema: DesignRevisionSchema },
    ]),
  ],
  controllers: [DesignsController],
  providers: [DesignsService],
  exports: [DesignsService],
})
export class DesignsModule {}
