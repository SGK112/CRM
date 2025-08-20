import { IsEmail, IsOptional, IsString, IsBoolean, IsDateString, IsNumber, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsString() country?: string;
}

class InsuranceDto {
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() policyNumber?: string;
  @IsOptional() @IsDateString() effectiveDate?: string;
  @IsOptional() @IsDateString() expirationDate?: string;
}

class CertificationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() identifier?: string;
  @IsOptional() @IsDateString() issuedDate?: string;
  @IsOptional() @IsDateString() expirationDate?: string;
  @IsOptional() @IsString() issuingAuthority?: string;
}

class TrainingDto {
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() topic?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() @Min(0) hours?: number;
  @IsOptional() @IsString() trainer?: string;
  @IsOptional() @IsString() certificateUrl?: string;
}

class DisciplinaryActionDto {
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() issuedBy?: string;
  @IsOptional() @IsString() actionTaken?: string;
}

class TimeEntryDto {
  @IsOptional() @IsDateString() periodStart?: string;
  @IsOptional() @IsDateString() periodEnd?: string;
  @IsOptional() @IsNumber() @Min(0) regularHours?: number;
  @IsOptional() @IsNumber() @Min(0) overtimeHours?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() approvedBy?: string;
}

export class CreateEmployeeDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsDateString() hireDate?: string;
  @IsOptional() @IsDateString() terminationDate?: string;
  @IsOptional() @IsBoolean() active?: boolean;

  @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
  @IsOptional() @ValidateNested() @Type(() => InsuranceDto) insurance?: InsuranceDto;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CertificationDto) certifications?: CertificationDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => TrainingDto) trainings?: TrainingDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => DisciplinaryActionDto) disciplinaryActions?: DisciplinaryActionDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => TimeEntryDto) timeEntries?: TimeEntryDto[];

  @IsOptional() @IsNumber() @Min(0) hourlyRate?: number;
  @IsOptional() @IsNumber() @Min(0) salaryAnnual?: number;
}

export class UpdateEmployeeDto extends CreateEmployeeDto {}

export class AddCertificationDto extends CertificationDto {}
export class AddTrainingDto extends TrainingDto {}
export class AddDisciplinaryActionDto extends DisciplinaryActionDto {}
export class AddTimeEntryDto extends TimeEntryDto {}
