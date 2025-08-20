import { IsString, IsOptional, IsIn, IsNumber, IsArray } from 'class-validator';

export class CreateMediaRecordDto {
  @IsString() workspaceId: string; // injected server side
  @IsOptional() @IsString() projectId?: string;
  @IsString() uploaderUserId: string; // from auth
  @IsString() provider: string;
  @IsString() originalFilename: string;
  @IsString() mimeType: string;
  @IsNumber() bytes: number;
  @IsOptional() @IsNumber() width?: number;
  @IsOptional() @IsNumber() height?: number;
  @IsString() hash: string;
  @IsString() publicId: string;
  @IsOptional() @IsIn(['public','workspace','restricted']) access?: string;
  @IsOptional() @IsArray() tags?: string[];
}

export class SignUploadDto {
  @IsOptional() @IsString() folder?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsIn(['public','workspace','restricted']) access?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsString() mimeType?: string;
}
