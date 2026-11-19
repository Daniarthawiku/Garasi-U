import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto.js';
import { UpdateFuelLogDto } from './dto/update-fuel-log.dto.js';
import { FuelLogsService } from './fuel-logs.service.js';

@Controller('fuel-logs')
@UseGuards(AuthGuard)
export class FuelLogsController {
  constructor(private readonly fuelLogsService: FuelLogsService) {}

  @Post()
  create(@Body() createFuelLogDto: CreateFuelLogDto) {
    return this.fuelLogsService.create(createFuelLogDto);
  }

  @Get()
  findAll(
    @Query('vehicleId', new ParseUUIDPipe({ optional: true }))
    vehicleId?: string,
  ) {
    return this.fuelLogsService.findAll(vehicleId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fuelLogsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFuelLogDto: UpdateFuelLogDto,
  ) {
    return this.fuelLogsService.update(id, updateFuelLogDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fuelLogsService.remove(id);
  }
}
