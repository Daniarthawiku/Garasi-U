import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createInMemoryPrismaMock } from '../prisma/prisma-mock.helper.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  VehicleServiceStatus,
  VehicleType,
} from './entities/vehicle.entity.js';
import { VehiclesService } from './vehicles.service.js';

describe('VehiclesService', () => {
  let service: VehiclesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: PrismaService,
          useValue: createInMemoryPrismaMock(),
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  it('should create a vehicle with initial NOT_SYNC status and empty parts', async () => {
    const vehicle = await service.create({
      brand: 'Toyota',
      model: 'GR Yaris',
      nickname: 'Pocket Rocket',
      type: VehicleType.CAR,
      year: 2022,
      plate: 'F 1618 GRY',
      tankCapacity: 50.5,
      initialOdometer: 36200,
    });

    expect(vehicle.id).toBeDefined();
    expect(vehicle.serviceStatus).toBe(VehicleServiceStatus.NOT_SYNC);
    expect(vehicle.parts).toEqual([]);
    expect(vehicle.currentOdometer).toBe(36200);
    expect(vehicle.isActive).toBe(true);
    expect(vehicle.lastServiceDate).toBeNull();
  });

  it('should reject duplicate license plates (case-insensitive)', async () => {
    await service.create({
      brand: 'Toyota',
      model: 'GR Yaris',
      type: VehicleType.CAR,
      plate: 'B 1234 ABC',
      initialOdometer: 1000,
    });

    await expect(
      service.create({
        brand: 'Honda',
        model: 'Civic',
        type: VehicleType.CAR,
        plate: 'b 1234 abc',
        initialOdometer: 500,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should support findAll, findOne, update, and remove', async () => {
    const created = await service.create({
      brand: 'Ducati',
      model: 'Panigale V4R',
      type: VehicleType.MOTORCYCLE,
      initialOdometer: 15000,
    });

    expect(await service.findAll()).toHaveLength(1);
    expect((await service.findOne(created.id)).model).toBe('Panigale V4R');

    const updated = await service.update(created.id, {
      nickname: 'Red Rocket',
      currentOdometer: 18450,
    });
    expect(updated.nickname).toBe('Red Rocket');
    expect(updated.currentOdometer).toBe(18450);

    const removed = await service.remove(created.id);
    expect(removed).toEqual({ deleted: true, id: created.id });
    expect(await service.findAll()).toHaveLength(0);
    await expect(service.findOne(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException when updating currentOdometer below initialOdometer', async () => {
    const vehicle = await service.create({
      brand: 'Toyota',
      model: 'Yaris',
      type: VehicleType.CAR,
      initialOdometer: 50000,
    });

    await expect(
      service.update(vehicle.id, { currentOdometer: 45000 }),
    ).rejects.toThrow(BadRequestException);
  });
});
