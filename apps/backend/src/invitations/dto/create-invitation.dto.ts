import { IsEmail, IsIn, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsIn(['owner','admin','sales_associate','project_manager','team_member','client'])
  role: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  ttlHours?: number; // default 168
}

export class AcceptInvitationDto {
  @IsString()
  token: string;

  // Later allow setting name/password if new user
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
