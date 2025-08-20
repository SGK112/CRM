import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class PurchaseTokensDto {
  @IsInt() @Min(1) quantity: number; // tokens to add
  @IsOptional() @IsString() paymentIntentId?: string; // Stripe PI id
}

export class ConsumeTokensDto {
  @IsInt() @Min(1) quantity: number; // tokens to consume
  @IsOptional() @IsString() reason?: string; // e.g. 'ai.chat', 'ai.generate_estimate'
  @IsOptional() @IsString() referenceId?: string; // related entity id
}
