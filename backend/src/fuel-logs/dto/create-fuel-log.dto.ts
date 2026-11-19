import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export const ALLOWED_FUEL_TYPES = [
  'Pertalite',
  'Pertamax',
  'Pertamax Green 95',
  'Pertamax Turbo',
  'Shell Super',
  'Shell V-Power',
  'BP 92',
  'BP Ultimate',
  'Dexlite',
  'Pertamina Dex',
] as const;

export class CreateFuelLogDto {
  @IsUUID()
  vehicleId: string;

  @IsString()
  @IsIn(ALLOWED_FUEL_TYPES)
  fuelType: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  liters: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  totalCost: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  odometerAtRefuel: number;

  @IsBoolean()
  isFullTank: boolean;

  @IsDateString()
  refuelDate: string;
}
