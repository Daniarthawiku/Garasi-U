import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceLogDto } from './create-service-log.dto.js';

export class UpdateServiceLogDto extends PartialType(CreateServiceLogDto) {}

