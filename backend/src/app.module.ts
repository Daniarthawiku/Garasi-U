import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { FuelLogsModule } from './fuel-logs/fuel-logs.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ServiceLogsModule } from './service-logs/service-logs.module.js';
import { VehiclesModule } from './vehicles/vehicles.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    VehiclesModule,
    ServiceLogsModule,
    FuelLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
