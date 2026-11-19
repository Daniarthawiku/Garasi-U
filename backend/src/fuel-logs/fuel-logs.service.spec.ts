import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VehicleType } from '../vehicles/entities/vehicle.entity.js';
import { VehiclesService } from '../vehicles/vehicles.service.js';
import { FuelLogsService } from './fuel-logs.service.js';

describe('FuelLogsService', () => {
  let fuelLogsService: FuelLogsService;
  let vehiclesService: VehiclesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehiclesService, FuelLogsService],
    }).compile();

    vehiclesService = module.get<VehiclesService>(VehiclesService);
    fuelLogsService = module.get<FuelLogsService>(FuelLogsService);
  });

  it('should compute full-to-full fuelEfficiency and sync vehicle odometer', () => {
    const vehicle = vehiclesService.create({
      brand: 'Toyota',
      model: 'GR Yaris',
      type: VehicleType.CAR,
      tankCapacity: 50,
      initialOdometer: 10000,
    });

    const firstFill = fuelLogsService.create({
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
    expect(vehiclesService.findOne(vehicle.id).currentOdometer).toBe(10200);

    const secondFill = fuelLogsService.create({
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
    expect(vehiclesService.findOne(vehicle.id).currentOdometer).toBe(10550);
  });

  it('should throw NotFoundException for missing vehicleId or missing fuel log id', () => {
    expect(() =>
      fuelLogsService.create({
        vehicleId: '00000000-0000-4000-8000-000000000000',
        fuelType: 'Pertamax',
        liters: 20,
        totalCost: 260000,
        odometerAtRefuel: 1000,
        isFullTank: true,
        refuelDate: '2026-11-19',
      }),
    ).toThrow(NotFoundException);

    expect(() => fuelLogsService.findOne(999)).toThrow(NotFoundException);
  });

  it('should throw BadRequestException when odometer moves backward or liters exceed tankCapacity', () => {
    const vehicle = vehiclesService.create({
      brand: 'Honda',
      model: 'Civic',
      type: VehicleType.CAR,
      tankCapacity: 47,
      initialOdometer: 15000,
    });

    expect(() =>
      fuelLogsService.create({
        vehicleId: vehicle.id,
        fuelType: 'Pertamax',
        liters: 20,
        totalCost: 260000,
        odometerAtRefuel: 14500,
        isFullTank: true,
        refuelDate: '2026-11-19',
      }),
    ).toThrow(BadRequestException);

    expect(() =>
      fuelLogsService.create({
        vehicleId: vehicle.id,
        fuelType: 'Pertamax',
        liters: 50,
        totalCost: 650000,
        odometerAtRefuel: 15300,
        isFullTank: true,
        refuelDate: '2026-11-19',
      }),
    ).toThrow(BadRequestException);
  });

  it('should support findAll, findOne, update, and remove', () => {
    const vehicle = vehiclesService.create({
      brand: 'Ducati',
      model: 'Panigale V4R',
      type: VehicleType.MOTORCYCLE,
      tankCapacity: 16,
      initialOdometer: 5000,
    });

    const created = fuelLogsService.create({
      vehicleId: vehicle.id,
      fuelType: 'Shell V-Power',
      liters: 12,
      totalCost: 192000,
      odometerAtRefuel: 5180,
      isFullTank: false,
      refuelDate: '2026-11-19',
    });

    expect(fuelLogsService.findAll(vehicle.id)).toHaveLength(1);
    expect(fuelLogsService.findOne(created.id).fuelType).toBe('Shell V-Power');

    const updated = fuelLogsService.update(created.id, {
      fuelType: 'BP Ultimate',
      totalCost: 200000,
    });
    expect(updated.fuelType).toBe('BP Ultimate');
    expect(updated.totalCost).toBe(200000);

    const removed = fuelLogsService.remove(created.id);
    expect(removed.deleted).toBe(true);
    expect(removed.id).toBe(created.id);
    expect(fuelLogsService.findAll()).toHaveLength(0);
  });
});
