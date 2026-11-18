import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { VehicleType } from '../entities/vehicle.entity.js';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateVehicleDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  brand: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  model: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(80)
  nickname?: string;

  @IsEnum(VehicleType)
  type: VehicleType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(20)
  plate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tankCapacity?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  initialOdometer: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
