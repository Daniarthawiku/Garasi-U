import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Vehicle as PrismaVehicle,
  VehiclePart as PrismaVehiclePart,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import {
  Vehicle,
  VehiclePart,
  VehicleServiceStatus,
  VehicleType,
} from './entities/vehicle.entity.js';

export interface SyncVehicleFromServiceInput {
  partName: string;
  odometerAtService: number;
  serviceDate: Date;
  intervalKm?: number;
}

type PrismaVehicleWithParts = PrismaVehicle & {
  parts: PrismaVehiclePart[];
};

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const normalizedPlate = createVehicleDto.plate?.trim() || null;

    if (normalizedPlate) {
      const duplicatePlate = await this.prisma.vehicle.findFirst({
        where: {
          plate: {
            equals: normalizedPlate,
            mode: 'insensitive',
          },
        },
      });
      if (duplicatePlate) {
        throw new ConflictException(
          `Vehicle with plate "${normalizedPlate}" already exists`,
        );
      }
    }

    const created = await this.prisma.vehicle.create({
      data: {
        brand: createVehicleDto.brand.trim(),
        model: createVehicleDto.model.trim(),
        nickname: createVehicleDto.nickname?.trim() || null,
        type: createVehicleDto.type,
        year: createVehicleDto.year ?? null,
        plate: normalizedPlate,
        tankCapacity: createVehicleDto.tankCapacity ?? null,
        initialOdometer: createVehicleDto.initialOdometer,
        currentOdometer: createVehicleDto.initialOdometer,
        serviceStatus: VehicleServiceStatus.NOT_SYNC,
        isActive: createVehicleDto.isActive ?? true,
        lastServiceDate: null,
      },
      include: { parts: true },
    });

    return this.toVehicleEntity(created);
  }

  async findAll(): Promise<Vehicle[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      include: { parts: true },
      orderBy: { createdAt: 'asc' },
    });
    return vehicles.map((v) => this.toVehicleEntity(v));
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { parts: true },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found`);
    }
    return this.toVehicleEntity(vehicle);
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const existing = await this.findOne(id);

    let normalizedPlate = existing.plate;
    if (updateVehicleDto.plate !== undefined) {
      normalizedPlate = updateVehicleDto.plate?.trim() || null;
      if (normalizedPlate) {
        const duplicatePlate = await this.prisma.vehicle.findFirst({
          where: {
            id: { not: id },
            plate: {
              equals: normalizedPlate,
              mode: 'insensitive',
            },
          },
        });
        if (duplicatePlate) {
          throw new ConflictException(
            `Vehicle with plate "${normalizedPlate}" already exists`,
          );
        }
      }
    }

    const nextInitialOdometer =
      updateVehicleDto.initialOdometer ?? existing.initialOdometer;
    const nextCurrentOdometer =
      updateVehicleDto.currentOdometer ?? existing.currentOdometer;

    if (nextCurrentOdometer < nextInitialOdometer) {
      throw new BadRequestException(
        `Current odometer (${nextCurrentOdometer} km) cannot be less than initial odometer (${nextInitialOdometer} km)`,
      );
    }

    const nextServiceStatus =
      updateVehicleDto.currentOdometer !== undefined
        ? this.computeServiceStatus(nextCurrentOdometer, existing.parts)
        : existing.serviceStatus;

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(updateVehicleDto.plate !== undefined && { plate: normalizedPlate }),
        ...(updateVehicleDto.brand !== undefined && {
          brand: updateVehicleDto.brand.trim(),
        }),
        ...(updateVehicleDto.model !== undefined && {
          model: updateVehicleDto.model.trim(),
        }),
        ...(updateVehicleDto.nickname !== undefined && {
          nickname: updateVehicleDto.nickname?.trim() || null,
        }),
        ...(updateVehicleDto.type !== undefined && {
          type: updateVehicleDto.type,
        }),
        ...(updateVehicleDto.year !== undefined && {
          year: updateVehicleDto.year ?? null,
        }),
        ...(updateVehicleDto.tankCapacity !== undefined && {
          tankCapacity: updateVehicleDto.tankCapacity ?? null,
        }),
        ...(updateVehicleDto.initialOdometer !== undefined && {
          initialOdometer: updateVehicleDto.initialOdometer,
        }),
        ...(updateVehicleDto.currentOdometer !== undefined && {
          currentOdometer: updateVehicleDto.currentOdometer,
          serviceStatus: nextServiceStatus,
        }),
        ...(updateVehicleDto.isActive !== undefined && {
          isActive: updateVehicleDto.isActive,
        }),
      },
      include: { parts: true },
    });

    return this.toVehicleEntity(updated);
  }

  async remove(id: string): Promise<{ deleted: boolean; id: string }> {
    await this.findOne(id);
    await this.prisma.vehicle.delete({
      where: { id },
    });
    return { deleted: true, id };
  }

  /**
   * Dipanggil oleh ServiceLogsService ketika riwayat servis baru dicatat:
   * - Memperbarui odometer & tanggal servis terakhir kendaraan
   * - Memunculkan / memperbarui komponen (VehiclePart) di kendaraan
   * - Menghitung ulang status servis kendaraan (NOT_SYNC -> HEALTHY / SERVICE_SOON / NEED_MAINTENANCE)
   */
  async syncFromServiceLog(
    vehicleId: string,
    input: SyncVehicleFromServiceInput,
  ): Promise<VehiclePart> {
    const vehicle = await this.findOne(vehicleId);

    const nextCurrentOdometer = Math.max(
      vehicle.currentOdometer,
      input.odometerAtService,
    );

    const nextLastServiceDate =
      !vehicle.lastServiceDate ||
      input.serviceDate.getTime() >= vehicle.lastServiceDate.getTime()
        ? input.serviceDate
        : vehicle.lastServiceDate;

    const trimmedPartName = input.partName.trim();
    const existingPart = vehicle.parts.find(
      (p) => p.name.toLowerCase() === trimmedPartName.toLowerCase(),
    );

    let savedPart: PrismaVehiclePart;
    if (!existingPart) {
      savedPart = await this.prisma.vehiclePart.create({
        data: {
          vehicleId: vehicle.id,
          name: trimmedPartName,
          intervalKm: input.intervalKm ?? 5000,
          lastServiceOdo: input.odometerAtService,
          lastServiceDate: input.serviceDate,
        },
      });
    } else {
      const shouldUpdateLastService =
        input.odometerAtService >= existingPart.lastServiceOdo;
      savedPart = await this.prisma.vehiclePart.update({
        where: { id: existingPart.id },
        data: {
          ...(shouldUpdateLastService && {
            lastServiceOdo: input.odometerAtService,
            lastServiceDate: input.serviceDate,
          }),
          ...(input.intervalKm && { intervalKm: input.intervalKm }),
        },
      });
    }

    const allParts = await this.prisma.vehiclePart.findMany({
      where: { vehicleId: vehicle.id },
    });

    const nextStatus = this.computeServiceStatus(nextCurrentOdometer, allParts);

    await this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        currentOdometer: nextCurrentOdometer,
        lastServiceDate: nextLastServiceDate,
        serviceStatus: nextStatus,
      },
    });

    return this.toVehiclePartEntity(savedPart, nextCurrentOdometer);
  }

  private computePartWear(
    currentOdometer: number,
    part: Pick<PrismaVehiclePart, 'lastServiceOdo' | 'intervalKm'>,
  ): number {
    const distanceSinceService = Math.max(
      0,
      currentOdometer - part.lastServiceOdo,
    );
    return part.intervalKm > 0
      ? Math.round((distanceSinceService / part.intervalKm) * 100)
      : 0;
  }

  private computeServiceStatus(
    currentOdometer: number,
    parts: Array<Pick<PrismaVehiclePart, 'lastServiceOdo' | 'intervalKm'>>,
  ): VehicleServiceStatus {
    if (parts.length === 0) {
      return VehicleServiceStatus.NOT_SYNC;
    }

    let hasOverdue = false;
    let hasDueSoon = false;

    for (const part of parts) {
      const wearPercent = this.computePartWear(currentOdometer, part);
      if (wearPercent >= 100) {
        hasOverdue = true;
      } else if (wearPercent >= 75) {
        hasDueSoon = true;
      }
    }

    if (hasOverdue) {
      return VehicleServiceStatus.NEED_MAINTENANCE;
    }
    if (hasDueSoon) {
      return VehicleServiceStatus.SERVICE_SOON;
    }
    return VehicleServiceStatus.HEALTHY;
  }

  private toVehiclePartEntity(
    part: PrismaVehiclePart,
    currentOdometer: number,
  ): VehiclePart {
    return {
      id: part.id,
      vehicleId: part.vehicleId,
      name: part.name,
      intervalKm: part.intervalKm,
      lastServiceOdo: part.lastServiceOdo,
      lastServiceDate: part.lastServiceDate,
      wear: this.computePartWear(currentOdometer, part),
      createdAt: part.createdAt,
      updatedAt: part.updatedAt,
    };
  }

  private toVehicleEntity(vehicle: PrismaVehicleWithParts): Vehicle {
    const parts = (vehicle.parts ?? []).map((p) =>
      this.toVehiclePartEntity(p, vehicle.currentOdometer),
    );
    const computedStatus = this.computeServiceStatus(
      vehicle.currentOdometer,
      vehicle.parts ?? [],
    );

    return {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      nickname: vehicle.nickname,
      type: vehicle.type as VehicleType,
      year: vehicle.year,
      plate: vehicle.plate,
      tankCapacity: vehicle.tankCapacity,
      initialOdometer: vehicle.initialOdometer,
      currentOdometer: vehicle.currentOdometer,
      serviceStatus: computedStatus,
      isActive: vehicle.isActive,
      lastServiceDate: vehicle.lastServiceDate,
      parts,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }
}
