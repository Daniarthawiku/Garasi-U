import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreateServiceLogDto } from './dto/create-service-log.dto.js';
import { UpdateServiceLogDto } from './dto/update-service-log.dto.js';
import { ServiceCategory } from './entities/service-log.entity.js';
import { ServiceLogsService } from './service-logs.service.js';

@Controller('service-logs')
@UseGuards(AuthGuard)
export class ServiceLogsController {
  constructor(private readonly serviceLogsService: ServiceLogsService) {}

  @Post()
  create(@Body() createServiceLogDto: CreateServiceLogDto) {
    return this.serviceLogsService.create(createServiceLogDto);
  }

  @Get()
  findAll(
    @Query('vehicleId', new ParseUUIDPipe({ optional: true }))
    vehicleId?: string,
    @Query('category', new ParseEnumPipe(ServiceCategory, { optional: true }))
    category?: ServiceCategory,
  ) {
    return this.serviceLogsService.findAll(vehicleId, category);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceLogsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceLogDto: UpdateServiceLogDto,
  ) {
    return this.serviceLogsService.update(id, updateServiceLogDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceLogsService.remove(id);
  }
}

