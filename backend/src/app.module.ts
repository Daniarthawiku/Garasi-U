import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ServiceLogsModule } from './service-logs/service-logs.module.js';
import { VehiclesModule } from './vehicles/vehicles.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VehiclesModule,
    ServiceLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
