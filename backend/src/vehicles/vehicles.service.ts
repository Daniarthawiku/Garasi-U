import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import {
  Vehicle,
  VehiclePart,
  VehicleServiceStatus,
} from './entities/vehicle.entity.js';

export interface SyncVehicleFromServiceInput {
  partName: string;
  odometerAtService: number;
  serviceDate: Date;
  intervalKm?: number;
}

@Injectable()
export class VehiclesService {
  // Penyimpanan sementara di memori (akan dimigrasikan ke PostgreSQL + Prisma di langkah berikutnya)
  private readonly vehicles: Vehicle[] = [];

  create(createVehicleDto: CreateVehicleDto): Vehicle {
    const normalizedPlate = createVehicleDto.plate?.trim() || null;

    if (normalizedPlate) {
      const duplicatePlate = this.vehicles.find(
        (v) => v.plate?.toLowerCase() === normalizedPlate.toLowerCase(),
      );
      if (duplicatePlate) {
        throw new ConflictException(
          `Vehicle with plate "${normalizedPlate}" already exists`,
        );
      }
    }

    const now = new Date();
    const newVehicle: Vehicle = {
      id: randomUUID(),
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
      parts: [],
      createdAt: now,
      updatedAt: now,
    };

    this.vehicles.push(newVehicle);
    return newVehicle;
  }

  findAll(): Vehicle[] {
    return this.vehicles;
  }

  findOne(id: string): Vehicle {
    const vehicle = this.vehicles.find((v) => v.id === id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found`);
    }
    return vehicle;
  }

  update(id: string, updateVehicleDto: UpdateVehicleDto): Vehicle {
    const vehicle = this.findOne(id);

    if (updateVehicleDto.plate !== undefined) {
      const normalizedPlate = updateVehicleDto.plate?.trim() || null;
      if (normalizedPlate) {
        const duplicatePlate = this.vehicles.find(
          (v) =>
            v.id !== id &&
            v.plate?.toLowerCase() === normalizedPlate.toLowerCase(),
        );
        if (duplicatePlate) {
          throw new ConflictException(
            `Vehicle with plate "${normalizedPlate}" already exists`,
          );
        }
      }
      vehicle.plate = normalizedPlate;
    }

    if (updateVehicleDto.brand !== undefined) {
      vehicle.brand = updateVehicleDto.brand.trim();
    }
    if (updateVehicleDto.model !== undefined) {
      vehicle.model = updateVehicleDto.model.trim();
    }
    if (updateVehicleDto.nickname !== undefined) {
      vehicle.nickname = updateVehicleDto.nickname?.trim() || null;
    }
    if (updateVehicleDto.type !== undefined) {
      vehicle.type = updateVehicleDto.type;
    }
    if (updateVehicleDto.year !== undefined) {
      vehicle.year = updateVehicleDto.year ?? null;
    }
    if (updateVehicleDto.tankCapacity !== undefined) {
      vehicle.tankCapacity = updateVehicleDto.tankCapacity ?? null;
    }
    const nextInitialOdometer =
      updateVehicleDto.initialOdometer ?? vehicle.initialOdometer;
    const nextCurrentOdometer =
      updateVehicleDto.currentOdometer ?? vehicle.currentOdometer;

    if (nextCurrentOdometer < nextInitialOdometer) {
      throw new BadRequestException(
        `Current odometer (${nextCurrentOdometer} km) cannot be less than initial odometer (${nextInitialOdometer} km)`,
      );
    }

    if (updateVehicleDto.initialOdometer !== undefined) {
      vehicle.initialOdometer = updateVehicleDto.initialOdometer;
    }
    if (updateVehicleDto.currentOdometer !== undefined) {
      vehicle.currentOdometer = updateVehicleDto.currentOdometer;
      this.recalculatePartsAndStatus(vehicle);
    }
    if (updateVehicleDto.isActive !== undefined) {
      vehicle.isActive = updateVehicleDto.isActive;
    }

    vehicle.updatedAt = new Date();
    return vehicle;
  }

  remove(id: string): { deleted: boolean; id: string } {
    const index = this.vehicles.findIndex((v) => v.id === id);
    if (index === -1) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found`);
    }
    this.vehicles.splice(index, 1);
    return { deleted: true, id };
  }

  /**
   * Dipanggil oleh ServiceLogsService ketika riwayat servis baru dicatat:
   * - Memperbarui odometer & tanggal servis terakhir kendaraan
   * - Memunculkan / memperbarui komponen (VehiclePart) di kendaraan
   * - Menghitung ulang status servis kendaraan (NOT_SYNC -> HEALTHY / SERVICE_SOON / NEED_MAINTENANCE)
   */
  syncFromServiceLog(
    vehicleId: string,
    input: SyncVehicleFromServiceInput,
  ): VehiclePart {
    const vehicle = this.findOne(vehicleId);
    const now = new Date();

    if (input.odometerAtService > vehicle.currentOdometer) {
      vehicle.currentOdometer = input.odometerAtService;
    }

    if (
      !vehicle.lastServiceDate ||
      input.serviceDate.getTime() >= vehicle.lastServiceDate.getTime()
    ) {
      vehicle.lastServiceDate = input.serviceDate;
    }

    const trimmedPartName = input.partName.trim();
    let targetPart = vehicle.parts.find(
      (p) => p.name.toLowerCase() === trimmedPartName.toLowerCase(),
    );

    if (!targetPart) {
      targetPart = {
        id: randomUUID(),
        vehicleId: vehicle.id,
        name: trimmedPartName,
        intervalKm: input.intervalKm ?? 5000,
        lastServiceOdo: input.odometerAtService,
        lastServiceDate: input.serviceDate,
        wear: 0,
        createdAt: now,
        updatedAt: now,
      };
      vehicle.parts.push(targetPart);
    } else {
      if (input.odometerAtService >= targetPart.lastServiceOdo) {
        targetPart.lastServiceOdo = input.odometerAtService;
        targetPart.lastServiceDate = input.serviceDate;
      }
      if (input.intervalKm) {
        targetPart.intervalKm = input.intervalKm;
      }
      targetPart.updatedAt = now;
    }

    this.recalculatePartsAndStatus(vehicle);
    vehicle.updatedAt = now;
    return targetPart;
  }

  private recalculatePartsAndStatus(vehicle: Vehicle): void {
    if (vehicle.parts.length === 0) {
      vehicle.serviceStatus = VehicleServiceStatus.NOT_SYNC;
      return;
    }

    let hasOverdue = false;
    let hasDueSoon = false;

    for (const part of vehicle.parts) {
      const distanceSinceService = Math.max(
        0,
        vehicle.currentOdometer - part.lastServiceOdo,
      );
      const wearPercent =
        part.intervalKm > 0
          ? Math.round((distanceSinceService / part.intervalKm) * 100)
          : 0;
      part.wear = wearPercent;

      if (wearPercent >= 100) {
        hasOverdue = true;
      } else if (wearPercent >= 75) {
        hasDueSoon = true;
      }
    }

    if (hasOverdue) {
      vehicle.serviceStatus = VehicleServiceStatus.NEED_MAINTENANCE;
    } else if (hasDueSoon) {
      vehicle.serviceStatus = VehicleServiceStatus.SERVICE_SOON;
    } else {
      vehicle.serviceStatus = VehicleServiceStatus.HEALTHY;
    }
  }
}

