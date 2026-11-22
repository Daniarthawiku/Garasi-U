import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createInMemoryPrismaMock } from '../prisma/prisma-mock.helper.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  VehicleServiceStatus,
  VehicleType,
} from '../vehicles/entities/vehicle.entity.js';
import { VehiclesService } from '../vehicles/vehicles.service.js';
import {
  ServiceCategory,
  ServiceLogStatus,
} from './entities/service-log.entity.js';
import { ServiceLogsService } from './service-logs.service.js';

describe('ServiceLogsService', () => {
  let serviceLogsService: ServiceLogsService;
  let vehiclesService: VehiclesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        ServiceLogsService,
        {
          provide: PrismaService,
          useValue: createInMemoryPrismaMock(),
        },
      ],
    }).compile();

    vehiclesService = module.get<VehiclesService>(VehiclesService);
    serviceLogsService = module.get<ServiceLogsService>(ServiceLogsService);
  });

  it('should create a service log and populate vehicle parts & status from NOT_SYNC to HEALTHY', async () => {
    const vehicle = await vehiclesService.create({
      brand: 'Toyota',
      model: 'Yaris',
      type: VehicleType.CAR,
      initialOdometer: 140000,
    });

    expect(vehicle.serviceStatus).toBe(VehicleServiceStatus.NOT_SYNC);
    expect(vehicle.parts).toHaveLength(0);

    const log = await serviceLogsService.create({
      vehicleId: vehicle.id,
      serviceDate: '2026-11-15',
      odometerAtService: 142500,
      category: ServiceCategory.ROUTINE_MAINTENANCE,
      part: 'Engine Oil',
      workshop: 'Prestiges Motocars',
      cost: 620000,
      isWarrantyClaim: false,
    });

    expect(log.id).toBeDefined();
    expect(log.status).toBe(ServiceLogStatus.VERIFIED);
    expect(log.vehiclePartId).toBeDefined();

    const updatedVehicle = await vehiclesService.findOne(vehicle.id);
    expect(updatedVehicle.currentOdometer).toBe(142500);
    expect(updatedVehicle.serviceStatus).toBe(VehicleServiceStatus.HEALTHY);
    expect(updatedVehicle.parts).toHaveLength(1);
    expect(updatedVehicle.parts[0].name).toBe('Engine Oil');
    expect(updatedVehicle.parts[0].wear).toBe(0);
  });

  it('should throw NotFoundException when vehicleId does not exist', async () => {
    await expect(
      serviceLogsService.create({
        vehicleId: '00000000-0000-4000-8000-000000000000',
        serviceDate: '2026-11-15',
        odometerAtService: 10000,
        category: ServiceCategory.ROUTINE_MAINTENANCE,
        part: 'Brake Pads',
        workshop: 'Workshop A',
        cost: 300000,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should support findAll, findOne, update, and remove', async () => {
    const vehicle = await vehiclesService.create({
      brand: 'Honda',
      model: 'CBR250RR',
      type: VehicleType.MOTORCYCLE,
      initialOdometer: 5000,
    });

    const created = await serviceLogsService.create({
      vehicleId: vehicle.id,
      serviceDate: '2026-11-10',
      odometerAtService: 6000,
      category: ServiceCategory.UNSCHEDULED_REPAIR,
      part: 'Chain Kit',
      workshop: 'One3 Motoshop',
      cost: 850000,
    });

    expect(await serviceLogsService.findAll(vehicle.id)).toHaveLength(1);
    expect((await serviceLogsService.findOne(created.id)).workshop).toBe(
      'One3 Motoshop',
    );

    const updated = await serviceLogsService.update(created.id, {
      cost: 900000,
      isWarrantyClaim: true,
    });
    expect(updated.cost).toBe(900000);
    expect(updated.isWarrantyClaim).toBe(true);

    const removed = await serviceLogsService.remove(created.id);
    expect(removed).toEqual({ deleted: true, id: created.id });
    expect(await serviceLogsService.findAll()).toHaveLength(0);
  });

  it('should throw BadRequestException when odometerAtService is below initialOdometer or vehicle is inactive', async () => {
    const activeVehicle = await vehiclesService.create({
      brand: 'Toyota',
      model: 'GR86',
      type: VehicleType.CAR,
      initialOdometer: 20000,
    });

    await expect(
      serviceLogsService.create({
        vehicleId: activeVehicle.id,
        serviceDate: '2026-11-15',
        odometerAtService: 15000,
        category: ServiceCategory.ROUTINE_MAINTENANCE,
        part: 'Engine Oil',
        workshop: 'Auto2000',
        cost: 500000,
      }),
    ).rejects.toThrow(BadRequestException);

    const inactiveVehicle = await vehiclesService.create({
      brand: 'Honda',
      model: 'Brio',
      type: VehicleType.CAR,
      initialOdometer: 10000,
      isActive: false,
    });

    await expect(
      serviceLogsService.create({
        vehicleId: inactiveVehicle.id,
        serviceDate: '2026-11-15',
        odometerAtService: 12000,
        category: ServiceCategory.ROUTINE_MAINTENANCE,
        part: 'Engine Oil',
        workshop: 'Honda Resmi',
        cost: 400000,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
