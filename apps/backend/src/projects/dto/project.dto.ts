import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ example: 'Kitchen Remodel - Smith Residence' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Complete kitchen renovation including new cabinets, countertops, and appliances' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'lead', enum: ['lead', 'proposal', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled'] })
  @IsOptional()
  @IsEnum(['lead', 'proposal', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled'])
  status?: string;

  @ApiProperty({ example: 'high', enum: ['low', 'medium', 'high', 'urgent'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @ApiProperty({ example: '60d5ec2f2b24f820b4b6d4e1' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: ['60d5ec2f2b24f820b4b6d4e2'] })
  @IsOptional()
  @IsArray()
  assignedTo?: string[];

  @ApiProperty({ example: '2023-12-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budget?: number;

  @ApiProperty({ example: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA'
  }})
  @IsOptional()
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export class UpdateProjectDto {
  @ApiProperty({ example: 'Kitchen Remodel - Smith Residence (Updated)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'in_progress', enum: ['lead', 'proposal', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled'] })
  @IsOptional()
  @IsEnum(['lead', 'proposal', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled'])
  status?: string;

  @ApiProperty({ example: 'urgent', enum: ['low', 'medium', 'high', 'urgent'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @ApiProperty({ example: ['60d5ec2f2b24f820b4b6d4e2', '60d5ec2f2b24f820b4b6d4e3'] })
  @IsOptional()
  @IsArray()
  assignedTo?: string[];

  @ApiProperty({ example: '2023-12-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-03-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 55000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budget?: number;

  @ApiProperty({ example: 45000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  actualCost?: number;

  @ApiProperty({ example: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA'
  }})
  @IsOptional()
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ example: ['contract.pdf', 'plans.pdf'] })
  @IsOptional()
  @IsArray()
  documents?: string[];
}
