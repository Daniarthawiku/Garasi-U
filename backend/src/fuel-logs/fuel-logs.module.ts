import { Module } from '@nestjs/common';
import { VehiclesModule } from '../vehicles/vehicles.module.js';
import { FuelLogsController } from './fuel-logs.controller.js';
import { FuelLogsService } from './fuel-logs.service.js';

@Module({
  imports: [VehiclesModule],
  controllers: [FuelLogsController],
  providers: [FuelLogsService],
})
export class FuelLogsModule {}
