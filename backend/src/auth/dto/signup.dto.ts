import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimLower = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class SignupDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  fullName: string;

  @Transform(trimLower)
  @IsEmail()
  email: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  primaryVehicle?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
