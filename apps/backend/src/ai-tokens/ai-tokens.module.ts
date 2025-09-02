import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiTokenBalance, AiTokenBalanceSchema } from './schemas/ai-token-balance.schema';
import { AiTokensService } from './ai-tokens.service';
import { AiTokensController } from './ai-tokens.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiTokenBalance.name, schema: AiTokenBalanceSchema }]),
  ],
  providers: [AiTokensService],
  controllers: [AiTokensController],
  exports: [AiTokensService],
})
export class AiTokensModule {}
