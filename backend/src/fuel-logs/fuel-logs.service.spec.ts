import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createInMemoryPrismaMock } from '../prisma/prisma-mock.helper.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VehicleType } from '../vehicles/entities/vehicle.entity.js';
import { VehiclesService } from '../vehicles/vehicles.service.js';
import { FuelLogsService } from './fuel-logs.service.js';

describe('FuelLogsService', () => {
  let fuelLogsService: FuelLogsService;
  let vehiclesService: VehiclesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        FuelLogsService,
        {
          provide: PrismaService,
          useValue: createInMemoryPrismaMock(),
        },
      ],
    }).compile();

    vehiclesService = module.get<VehiclesService>(VehiclesService);
    fuelLogsService = module.get<FuelLogsService>(FuelLogsService);
  });

  it('should compute full-to-full fuelEfficiency and sync vehicle odometer', async () => {
    const vehicle = await vehiclesService.create({
      brand: 'Toyota',
      model: 'GR Yaris',
      type: VehicleType.CAR,
      tankCapacity: 50,
      initialOdometer: 10000,
    });

    const firstFill = await fuelLogsService.create({
      vehicleId: vehicle.id,
      fuelType: 'Pertamax Turbo',
      liters: 30,
      totalCost: 420000,
      odometerAtRefuel: 10200,
      isFullTank: true,
      refuelDate: '2026-11-10',
    });

    expect(firstFill.id).toBe(1);
    expect(firstFill.fuelEfficiency).toBeNull();
    expect((await vehiclesService.findOne(vehicle.id)).currentOdometer).toBe(
      10200,
    );

    const secondFill = await fuelLogsService.create({
      vehicleId: vehicle.id,
      fuelType: 'Pertamax Turbo',
      liters: 25,
      totalCost: 350000,
      odometerAtRefuel: 10550,
      isFullTank: true,
      refuelDate: '2026-11-19',
    });

    expect(secondFill.id).toBe(2);
    expect(secondFill.fuelEfficiency).toBe(14);
    expect((await vehiclesService.findOne(vehicle.id)).currentOdometer).toBe(
      10550,
    );
  });

  it('should throw NotFoundException for missing vehicleId or missing fuel log id', async () => {
    await expect(
      fuelLogsService.create({
        vehicleId: '00000000-0000-4000-8000-000000000000',
        fuelType: 'Pertamax',
        liters: 20,
        totalCost: 260000,
        odometerAtRefuel: 1000,
        isFullTank: true,
        refuelDate: '2026-11-19',
      }),
    ).rejects.toThrow(NotFoundException);

    await expect(fuelLogsService.findOne(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException when odometer moves backward or liters exceed tankCapacity', async () => {
    const vehicle = await vehiclesService.create({
      brand: 'Honda',
      model: 'Civic',
      type: VehicleType.CAR,
      tankCapacity: 47,
      initialOdometer: 15000,
    });

    await expect(
      fuelLogsService.create({
        vehicleId: vehicle.id,
        fuelType: 'Pertamax',
        liters: 20,
        totalCost: 260000,
        odometerAtRefuel: 14500,
        isFullTank: true,
        refuelDate: '2026-11-19',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      fuelLogsService.create({
        vehicleId: vehicle.id,
        fuelType: 'Pertamax',
        liters: 50,
        totalCost: 650000,
        odometerAtRefuel: 15300,
        isFullTank: true,
        refuelDate: '2026-11-19',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should support findAll, findOne, update, and remove', async () => {
    const vehicle = await vehiclesService.create({
      brand: 'Ducati',
      model: 'Panigale V4R',
      type: VehicleType.MOTORCYCLE,
      tankCapacity: 16,
      initialOdometer: 5000,
    });

    const created = await fuelLogsService.create({
      vehicleId: vehicle.id,
      fuelType: 'Shell V-Power',
      liters: 12,
      totalCost: 192000,
      odometerAtRefuel: 5180,
      isFullTank: false,
      refuelDate: '2026-11-19',
    });

    expect(await fuelLogsService.findAll(vehicle.id)).toHaveLength(1);
    expect((await fuelLogsService.findOne(created.id)).fuelType).toBe(
      'Shell V-Power',
    );

    const updated = await fuelLogsService.update(created.id, {
      fuelType: 'BP Ultimate',
      totalCost: 200000,
    });
    expect(updated.fuelType).toBe('BP Ultimate');
    expect(updated.totalCost).toBe(200000);

    const removed = await fuelLogsService.remove(created.id);
    expect(removed.deleted).toBe(true);
    expect(removed.id).toBe(created.id);
    expect(await fuelLogsService.findAll()).toHaveLength(0);
  });
});
