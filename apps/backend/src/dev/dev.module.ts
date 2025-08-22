import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [DevController],
  providers: [DevService],
})
export class DevModule {}
