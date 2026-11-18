import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateVehicleDto } from './create-vehicle.dto.js';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentOdometer?: number;
}
