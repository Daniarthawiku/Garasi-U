import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FuelLog as PrismaFuelLog } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { VehiclesService } from '../vehicles/vehicles.service.js';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto.js';
import { UpdateFuelLogDto } from './dto/update-fuel-log.dto.js';
import { FuelLog } from './entities/fuel-log.entity.js';

@Injectable()
export class FuelLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  async create(createFuelLogDto: CreateFuelLogDto): Promise<FuelLog> {
    const vehicle = await this.vehiclesService.findOne(
      createFuelLogDto.vehicleId,
    );

    if (!vehicle.isActive) {
      throw new BadRequestException(
        `Tidak dapat mencatat pengisian BBM untuk kendaraan non-aktif "${vehicle.brand} ${vehicle.model}"`,
      );
    }

    if (createFuelLogDto.odometerAtRefuel < vehicle.currentOdometer) {
      throw new BadRequestException(
        `Odometer saat pengisian (${createFuelLogDto.odometerAtRefuel} km) tidak boleh lebih kecil dari odometer kendaraan saat ini (${vehicle.currentOdometer} km)`,
      );
    }

    if (
      vehicle.tankCapacity !== null &&
      vehicle.tankCapacity > 0 &&
      createFuelLogDto.liters > vehicle.tankCapacity
    ) {
      throw new BadRequestException(
        `Volume pengisian (${createFuelLogDto.liters} L) melebihi kapasitas maksimal tangki kendaraan (${vehicle.tankCapacity} L)`,
      );
    }

    let fuelEfficiency: number | null = null;
    if (createFuelLogDto.isFullTank) {
      const lastFullLog = await this.prisma.fuelLog.findFirst({
        where: {
          vehicleId: createFuelLogDto.vehicleId,
          isFullTank: true,
        },
        orderBy: { id: 'desc' },
      });

      if (lastFullLog) {
        const distance =
          createFuelLogDto.odometerAtRefuel - lastFullLog.odometerAtRefuel;
        fuelEfficiency = Number(
          (distance / createFuelLogDto.liters).toFixed(2),
        );
      }
    }

    // Sinkronisasi odometer kendaraan dan hitung ulang wear komponen jika ada
    await this.vehiclesService.update(vehicle.id, {
      currentOdometer: createFuelLogDto.odometerAtRefuel,
    });

    const parsedDate = new Date(createFuelLogDto.refuelDate.slice(0, 10));
    const created = await this.prisma.fuelLog.create({
      data: {
        vehicleId: createFuelLogDto.vehicleId,
        fuelType: createFuelLogDto.fuelType,
        liters: createFuelLogDto.liters,
        totalCost: createFuelLogDto.totalCost,
        odometerAtRefuel: createFuelLogDto.odometerAtRefuel,
        isFullTank: createFuelLogDto.isFullTank,
        fuelEfficiency,
        refuelDate: parsedDate,
      },
    });

    return this.toFuelLogEntity(created);
  }

  async findAll(vehicleId?: string): Promise<FuelLog[]> {
    if (vehicleId) {
      await this.vehiclesService.findOne(vehicleId);
    }

    const logs = await this.prisma.fuelLog.findMany({
      where: {
        ...(vehicleId && { vehicleId }),
      },
      orderBy: { id: 'desc' },
    });

    return logs.map((log) => this.toFuelLogEntity(log));
  }

  async findOne(id: number): Promise<FuelLog> {
    const log = await this.prisma.fuelLog.findUnique({
      where: { id },
    });
    if (!log) {
      throw new NotFoundException(
        `Catatan BBM dengan ID ${id} tidak ditemukan`,
      );
    }
    return this.toFuelLogEntity(log);
  }

  async update(
    id: number,
    updateFuelLogDto: UpdateFuelLogDto,
  ): Promise<FuelLog> {
    const existing = await this.findOne(id);
    const targetVehicleId = updateFuelLogDto.vehicleId ?? existing.vehicleId;
    const vehicle = await this.vehiclesService.findOne(targetVehicleId);

    const nextLiters = updateFuelLogDto.liters ?? existing.liters;
    if (
      vehicle.tankCapacity !== null &&
      vehicle.tankCapacity > 0 &&
      nextLiters > vehicle.tankCapacity
    ) {
      throw new BadRequestException(
        `Volume pengisian (${nextLiters} L) melebihi kapasitas maksimal tangki kendaraan (${vehicle.tankCapacity} L)`,
      );
    }

    const nextOdometer =
      updateFuelLogDto.odometerAtRefuel ?? existing.odometerAtRefuel;
    if (nextOdometer < vehicle.initialOdometer) {
      throw new BadRequestException(
        `Odometer saat pengisian (${nextOdometer} km) tidak boleh lebih kecil dari odometer awal kendaraan (${vehicle.initialOdometer} km)`,
      );
    }

    if (
      updateFuelLogDto.odometerAtRefuel !== undefined &&
      updateFuelLogDto.odometerAtRefuel > vehicle.currentOdometer
    ) {
      await this.vehiclesService.update(vehicle.id, {
        currentOdometer: updateFuelLogDto.odometerAtRefuel,
      });
    }

    const updated = await this.prisma.fuelLog.update({
      where: { id },
      data: {
        ...(updateFuelLogDto.vehicleId !== undefined && {
          vehicleId: updateFuelLogDto.vehicleId,
        }),
        ...(updateFuelLogDto.fuelType !== undefined && {
          fuelType: updateFuelLogDto.fuelType,
        }),
        ...(updateFuelLogDto.liters !== undefined && {
          liters: updateFuelLogDto.liters,
        }),
        ...(updateFuelLogDto.totalCost !== undefined && {
          totalCost: updateFuelLogDto.totalCost,
        }),
        ...(updateFuelLogDto.odometerAtRefuel !== undefined && {
          odometerAtRefuel: updateFuelLogDto.odometerAtRefuel,
        }),
        ...(updateFuelLogDto.isFullTank !== undefined && {
          isFullTank: updateFuelLogDto.isFullTank,
        }),
        ...(updateFuelLogDto.refuelDate !== undefined && {
          refuelDate: new Date(updateFuelLogDto.refuelDate.slice(0, 10)),
        }),
      },
    });

    return this.toFuelLogEntity(updated);
  }

  async remove(
    id: number,
  ): Promise<{ deleted: boolean; id: number; message: string }> {
    await this.findOne(id);
    await this.prisma.fuelLog.delete({
      where: { id },
    });
    return {
      deleted: true,
      id,
      message: `Catatan BBM dengan ID ${id} berhasil dihapus`,
    };
  }

  private toFuelLogEntity(log: PrismaFuelLog): FuelLog {
    return {
      id: log.id,
      vehicleId: log.vehicleId,
      fuelType: log.fuelType,
      liters: log.liters,
      totalCost: Number(log.totalCost),
      odometerAtRefuel: log.odometerAtRefuel,
      isFullTank: log.isFullTank,
      fuelEfficiency: log.fuelEfficiency,
      refuelDate: log.refuelDate.toISOString().slice(0, 10),
      createdAt: log.createdAt,
    };
  }
}
