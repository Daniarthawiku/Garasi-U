import { Module } from '@nestjs/common';
import { VehiclesModule } from '../vehicles/vehicles.module.js';
import { ServiceLogsController } from './service-logs.controller.js';
import { ServiceLogsService } from './service-logs.service.js';

@Module({
  imports: [VehiclesModule],
  controllers: [ServiceLogsController],
  providers: [ServiceLogsService],
})
export class ServiceLogsModule {}

