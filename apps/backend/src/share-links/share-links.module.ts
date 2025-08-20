import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShareLink, ShareLinkSchema } from './schemas/share-link.schema';
import { ShareLinksService } from './share-links.service';
import { ShareLinksController } from './share-links.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ShareLink.name, schema: ShareLinkSchema }]),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'your-secret-key' }),
  ],
  providers: [ShareLinksService],
  controllers: [ShareLinksController],
  exports: [ShareLinksService],
})
export class ShareLinksModule {}
