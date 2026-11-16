import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ServiceCategory,
  ServiceLogStatus,
} from '../entities/service-log.entity.js';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateServiceLogDto {
  @IsUUID()
  vehicleId: string;

  @IsDateString()
  serviceDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  odometerAtService: number;

  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @IsOptional()
  @IsEnum(ServiceLogStatus)
  status?: ServiceLogStatus;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  part: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  workshop: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  cost: number;

  @IsOptional()
  @IsBoolean()
  isWarrantyClaim?: boolean;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  partIntervalKm?: number;
}
