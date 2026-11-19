import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VehiclesService } from '../vehicles/vehicles.service.js';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto.js';
import { UpdateFuelLogDto } from './dto/update-fuel-log.dto.js';
import { FuelLog } from './entities/fuel-log.entity.js';

@Injectable()
export class FuelLogsService {
  private readonly fuelLogs: FuelLog[] = [];
  private nextId = 1;

  constructor(private readonly vehiclesService: VehiclesService) {}

  create(createFuelLogDto: CreateFuelLogDto): FuelLog {
    const vehicle = this.vehiclesService.findOne(createFuelLogDto.vehicleId);

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
      const lastFullLog = this.fuelLogs.findLast(
        (log) => log.vehicleId === createFuelLogDto.vehicleId && log.isFullTank,
      );

      if (lastFullLog) {
        const distance =
          createFuelLogDto.odometerAtRefuel - lastFullLog.odometerAtRefuel;
        fuelEfficiency = Number(
          (distance / createFuelLogDto.liters).toFixed(2),
        );
      }
    }

    // Sinkronisasi odometer kendaraan dan hitung ulang wear komponen jika ada
    this.vehiclesService.update(vehicle.id, {
      currentOdometer: createFuelLogDto.odometerAtRefuel,
    });

    const newLog: FuelLog = {
      id: this.nextId++,
      vehicleId: createFuelLogDto.vehicleId,
      fuelType: createFuelLogDto.fuelType,
      liters: createFuelLogDto.liters,
      totalCost: createFuelLogDto.totalCost,
      odometerAtRefuel: createFuelLogDto.odometerAtRefuel,
      isFullTank: createFuelLogDto.isFullTank,
      fuelEfficiency,
      refuelDate: createFuelLogDto.refuelDate.slice(0, 10),
      createdAt: new Date(),
    };

    this.fuelLogs.push(newLog);
    return newLog;
  }

  findAll(vehicleId?: string): FuelLog[] {
    if (vehicleId) {
      this.vehiclesService.findOne(vehicleId);
    }

    return this.fuelLogs
      .filter((log) => (!vehicleId ? true : log.vehicleId === vehicleId))
      .toSorted((a, b) => b.id - a.id);
  }

  findOne(id: number): FuelLog {
    const log = this.fuelLogs.find((item) => item.id === id);
    if (!log) {
      throw new NotFoundException(
        `Catatan BBM dengan ID ${id} tidak ditemukan`,
      );
    }
    return log;
  }

  update(id: number, updateFuelLogDto: UpdateFuelLogDto): FuelLog {
    const log = this.findOne(id);
    const targetVehicleId = updateFuelLogDto.vehicleId ?? log.vehicleId;
    const vehicle = this.vehiclesService.findOne(targetVehicleId);

    const nextLiters = updateFuelLogDto.liters ?? log.liters;
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
      updateFuelLogDto.odometerAtRefuel ?? log.odometerAtRefuel;
    if (nextOdometer < vehicle.initialOdometer) {
      throw new BadRequestException(
        `Odometer saat pengisian (${nextOdometer} km) tidak boleh lebih kecil dari odometer awal kendaraan (${vehicle.initialOdometer} km)`,
      );
    }

    if (updateFuelLogDto.vehicleId !== undefined) {
      log.vehicleId = updateFuelLogDto.vehicleId;
    }
    if (updateFuelLogDto.fuelType !== undefined) {
      log.fuelType = updateFuelLogDto.fuelType;
    }
    if (updateFuelLogDto.liters !== undefined) {
      log.liters = updateFuelLogDto.liters;
    }
    if (updateFuelLogDto.totalCost !== undefined) {
      log.totalCost = updateFuelLogDto.totalCost;
    }
    if (updateFuelLogDto.odometerAtRefuel !== undefined) {
      log.odometerAtRefuel = updateFuelLogDto.odometerAtRefuel;
      if (updateFuelLogDto.odometerAtRefuel > vehicle.currentOdometer) {
        this.vehiclesService.update(vehicle.id, {
          currentOdometer: updateFuelLogDto.odometerAtRefuel,
        });
      }
    }
    if (updateFuelLogDto.isFullTank !== undefined) {
      log.isFullTank = updateFuelLogDto.isFullTank;
    }
    if (updateFuelLogDto.refuelDate !== undefined) {
      log.refuelDate = updateFuelLogDto.refuelDate.slice(0, 10);
    }

    return log;
  }

  remove(id: number): { deleted: boolean; id: number; message: string } {
    this.findOne(id);
    const index = this.fuelLogs.findIndex((item) => item.id === id);
    this.fuelLogs.splice(index, 1);
    return {
      deleted: true,
      id,
      message: `Catatan BBM dengan ID ${id} berhasil dihapus`,
    };
  }
}
