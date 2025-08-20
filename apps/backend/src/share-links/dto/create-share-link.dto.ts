import { IsString, IsOptional, IsArray, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateShareLinkDto {
  @IsString() type: string; // project,file,meeting
  @IsString() targetId: string;
  @IsArray() permissions: string[];
  @IsOptional() @IsString() expiresAt?: string; // iso
  @IsOptional() @IsInt() @Min(1) maxUses?: number;
  @IsOptional() @IsString() password?: string;
  @IsOptional() metadata?: Record<string, any>;
  @IsOptional() @IsBoolean() singleUse?: boolean;
}

export class ClaimShareLinkDto {
  @IsOptional() @IsString() password?: string;
}
