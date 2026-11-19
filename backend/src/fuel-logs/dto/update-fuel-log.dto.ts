import { PartialType } from '@nestjs/mapped-types';
import { CreateFuelLogDto } from './create-fuel-log.dto.js';

export class UpdateFuelLogDto extends PartialType(CreateFuelLogDto) {}
