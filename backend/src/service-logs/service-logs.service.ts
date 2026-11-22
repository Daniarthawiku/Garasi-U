import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ServiceLog as PrismaServiceLog } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  async create(createServiceLogDto: CreateServiceLogDto): Promise<ServiceLog> {
    // Pastikan kendaraan yang dituju ada dan memenuhi aturan domain GarasiU
    const vehicle = await this.vehiclesService.findOne(
      createServiceLogDto.vehicleId,
    );

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
    const syncedPart = await this.vehiclesService.syncFromServiceLog(
      createServiceLogDto.vehicleId,
      {
        partName: createServiceLogDto.part,
        odometerAtService: createServiceLogDto.odometerAtService,
        serviceDate: parsedDate,
        intervalKm: createServiceLogDto.partIntervalKm,
      },
    );

    const created = await this.prisma.serviceLog.create({
      data: {
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
      },
    });

    return this.toServiceLogEntity(created);
  }

  async findAll(
    vehicleId?: string,
    category?: ServiceCategory,
  ): Promise<ServiceLog[]> {
    if (vehicleId) {
      await this.vehiclesService.findOne(vehicleId);
    }

    const logs = await this.prisma.serviceLog.findMany({
      where: {
        ...(vehicleId && { vehicleId }),
        ...(category && { category }),
      },
      orderBy: { serviceDate: 'desc' },
    });

    return logs.map((log) => this.toServiceLogEntity(log));
  }

  async findOne(id: string): Promise<ServiceLog> {
    const log = await this.prisma.serviceLog.findUnique({
      where: { id },
    });
    if (!log) {
      throw new NotFoundException(`Service log with ID "${id}" not found`);
    }
    return this.toServiceLogEntity(log);
  }

  async update(
    id: string,
    updateServiceLogDto: UpdateServiceLogDto,
  ): Promise<ServiceLog> {
    const existing = await this.findOne(id);

    const targetVehicleId = updateServiceLogDto.vehicleId ?? existing.vehicleId;
    const targetVehicle = await this.vehiclesService.findOne(targetVehicleId);

    if (
      updateServiceLogDto.vehicleId &&
      updateServiceLogDto.vehicleId !== existing.vehicleId &&
      !targetVehicle.isActive
    ) {
      throw new BadRequestException(
        `Cannot move service log to inactive vehicle "${targetVehicle.brand} ${targetVehicle.model}"`,
      );
    }

    const nextOdometer =
      updateServiceLogDto.odometerAtService ?? existing.odometerAtService;
    if (nextOdometer < targetVehicle.initialOdometer) {
      throw new BadRequestException(
        `Odometer at service (${nextOdometer} km) cannot be lower than vehicle initial odometer (${targetVehicle.initialOdometer} km)`,
      );
    }

    const nextServiceDate =
      updateServiceLogDto.serviceDate !== undefined
        ? new Date(updateServiceLogDto.serviceDate)
        : existing.serviceDate;
    const nextPart =
      updateServiceLogDto.part !== undefined
        ? updateServiceLogDto.part.trim()
        : existing.part;

    const syncedPart = await this.vehiclesService.syncFromServiceLog(
      targetVehicleId,
      {
        partName: nextPart,
        odometerAtService: nextOdometer,
        serviceDate: nextServiceDate,
        intervalKm: updateServiceLogDto.partIntervalKm,
      },
    );

    const updated = await this.prisma.serviceLog.update({
      where: { id },
      data: {
        vehicleId: targetVehicleId,
        vehiclePartId: syncedPart.id,
        serviceDate: nextServiceDate,
        odometerAtService: nextOdometer,
        ...(updateServiceLogDto.category !== undefined && {
          category: updateServiceLogDto.category,
        }),
        ...(updateServiceLogDto.status !== undefined && {
          status: updateServiceLogDto.status,
        }),
        part: nextPart,
        ...(updateServiceLogDto.workshop !== undefined && {
          workshop: updateServiceLogDto.workshop.trim(),
        }),
        ...(updateServiceLogDto.cost !== undefined && {
          cost: updateServiceLogDto.cost,
        }),
        ...(updateServiceLogDto.isWarrantyClaim !== undefined && {
          isWarrantyClaim: updateServiceLogDto.isWarrantyClaim,
        }),
        ...(updateServiceLogDto.notes !== undefined && {
          notes: updateServiceLogDto.notes?.trim() || null,
        }),
      },
    });

    return this.toServiceLogEntity(updated);
  }

  async remove(id: string): Promise<{ deleted: boolean; id: string }> {
    await this.findOne(id);
    await this.prisma.serviceLog.delete({
      where: { id },
    });
    return { deleted: true, id };
  }

  private toServiceLogEntity(log: PrismaServiceLog): ServiceLog {
    return {
      id: log.id,
      vehicleId: log.vehicleId,
      vehiclePartId: log.vehiclePartId,
      serviceDate: log.serviceDate,
      odometerAtService: log.odometerAtService,
      category: log.category as ServiceCategory,
      status: log.status as ServiceLogStatus,
      part: log.part,
      workshop: log.workshop,
      cost: Number(log.cost),
      isWarrantyClaim: log.isWarrantyClaim,
      notes: log.notes,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }
}
