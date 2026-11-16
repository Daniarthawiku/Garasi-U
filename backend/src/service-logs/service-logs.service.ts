import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VehiclesService } from '../vehicles/vehicles.service.js';
import { CreateServiceLogDto } from './dto/create-service-log.dto.js';
import { UpdateServiceLogDto } from './dto/update-service-log.dto.js';
import {
  ServiceCategory,
  ServiceLog,
  ServiceLogStatus,
} from './entities/service-log.entity.js';

@Injectable()
export class ServiceLogsService {
  // Penyimpanan sementara di memori (akan dimigrasikan ke PostgreSQL + Prisma di langkah berikutnya)
  private readonly serviceLogs: ServiceLog[] = [];

  constructor(private readonly vehiclesService: VehiclesService) {}

  create(createServiceLogDto: CreateServiceLogDto): ServiceLog {
    // Pastikan kendaraan yang dituju ada dan memenuhi aturan domain GarasiU
    const vehicle = this.vehiclesService.findOne(createServiceLogDto.vehicleId);

    if (!vehicle.isActive) {
      throw new BadRequestException(
        `Cannot record service log for inactive vehicle "${vehicle.brand} ${vehicle.model}"`,
      );
    }

    if (createServiceLogDto.odometerAtService < vehicle.initialOdometer) {
      throw new BadRequestException(
        `Odometer at service (${createServiceLogDto.odometerAtService} km) cannot be lower than vehicle initial odometer (${vehicle.initialOdometer} km)`,
      );
    }

    const parsedDate = new Date(createServiceLogDto.serviceDate);
    const syncedPart = this.vehiclesService.syncFromServiceLog(
      createServiceLogDto.vehicleId,
      {
        partName: createServiceLogDto.part,
        odometerAtService: createServiceLogDto.odometerAtService,
        serviceDate: parsedDate,
        intervalKm: createServiceLogDto.partIntervalKm,
      },
    );

    const now = new Date();
    const newLog: ServiceLog = {
      id: randomUUID(),
      vehicleId: createServiceLogDto.vehicleId,
      vehiclePartId: syncedPart.id,
      serviceDate: parsedDate,
      odometerAtService: createServiceLogDto.odometerAtService,
      category: createServiceLogDto.category,
      status: createServiceLogDto.status ?? ServiceLogStatus.VERIFIED,
      part: createServiceLogDto.part.trim(),
      workshop: createServiceLogDto.workshop.trim(),
      cost: createServiceLogDto.cost,
      isWarrantyClaim: createServiceLogDto.isWarrantyClaim ?? false,
      notes: createServiceLogDto.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };

    this.serviceLogs.push(newLog);
    return newLog;
  }

  findAll(vehicleId?: string, category?: ServiceCategory): ServiceLog[] {
    if (vehicleId) {
      this.vehiclesService.findOne(vehicleId);
    }

    return this.serviceLogs
      .filter((log) => {
        if (vehicleId && log.vehicleId !== vehicleId) return false;
        if (category && log.category !== category) return false;
        return true;
      })
      .toSorted((a, b) => b.serviceDate.getTime() - a.serviceDate.getTime());
  }

  findOne(id: string): ServiceLog {
    const log = this.serviceLogs.find((item) => item.id === id);
    if (!log) {
      throw new NotFoundException(`Service log with ID "${id}" not found`);
    }
    return log;
  }

  update(id: string, updateServiceLogDto: UpdateServiceLogDto): ServiceLog {
    const log = this.findOne(id);

    const targetVehicle = this.vehiclesService.findOne(
      updateServiceLogDto.vehicleId ?? log.vehicleId,
    );

    if (
      updateServiceLogDto.vehicleId &&
      updateServiceLogDto.vehicleId !== log.vehicleId
    ) {
      if (!targetVehicle.isActive) {
        throw new BadRequestException(
          `Cannot move service log to inactive vehicle "${targetVehicle.brand} ${targetVehicle.model}"`,
        );
      }
      log.vehicleId = updateServiceLogDto.vehicleId;
    }

    const nextOdometer =
      updateServiceLogDto.odometerAtService ?? log.odometerAtService;
    if (nextOdometer < targetVehicle.initialOdometer) {
      throw new BadRequestException(
        `Odometer at service (${nextOdometer} km) cannot be lower than vehicle initial odometer (${targetVehicle.initialOdometer} km)`,
      );
    }

    if (updateServiceLogDto.serviceDate !== undefined) {
      log.serviceDate = new Date(updateServiceLogDto.serviceDate);
    }
    if (updateServiceLogDto.odometerAtService !== undefined) {
      log.odometerAtService = updateServiceLogDto.odometerAtService;
    }
    if (updateServiceLogDto.category !== undefined) {
      log.category = updateServiceLogDto.category;
    }
    if (updateServiceLogDto.status !== undefined) {
      log.status = updateServiceLogDto.status;
    }
    if (updateServiceLogDto.part !== undefined) {
      log.part = updateServiceLogDto.part.trim();
    }
    if (updateServiceLogDto.workshop !== undefined) {
      log.workshop = updateServiceLogDto.workshop.trim();
    }
    if (updateServiceLogDto.cost !== undefined) {
      log.cost = updateServiceLogDto.cost;
    }
    if (updateServiceLogDto.isWarrantyClaim !== undefined) {
      log.isWarrantyClaim = updateServiceLogDto.isWarrantyClaim;
    }
    if (updateServiceLogDto.notes !== undefined) {
      log.notes = updateServiceLogDto.notes?.trim() || null;
    }

    const syncedPart = this.vehiclesService.syncFromServiceLog(log.vehicleId, {
      partName: log.part,
      odometerAtService: log.odometerAtService,
      serviceDate: log.serviceDate,
      intervalKm: updateServiceLogDto.partIntervalKm,
    });
    log.vehiclePartId = syncedPart.id;
    log.updatedAt = new Date();

    return log;
  }

  remove(id: string): { deleted: boolean; id: string } {
    const index = this.serviceLogs.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Service log with ID "${id}" not found`);
    }
    this.serviceLogs.splice(index, 1);
    return { deleted: true, id };
  }
}

