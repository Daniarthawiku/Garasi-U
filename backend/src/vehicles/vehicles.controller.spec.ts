import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { VehicleType } from './entities/vehicle.entity.js';
import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';

describe('VehiclesController', () => {
  let controller: VehiclesController;

  const mockVehiclesService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        {
          provide: VehiclesService,
          useValue: mockVehiclesService,
        },
      ],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
  });

  it('should call vehiclesService.create on POST /vehicles', () => {
    const dto = {
      brand: 'Toyota',
      model: 'GR Yaris',
      type: VehicleType.CAR,
      initialOdometer: 1000,
    };
    mockVehiclesService.create.mockReturnValue({ id: 'uuid-1', ...dto });

    const result = controller.create(dto);
    expect(mockVehiclesService.create).toHaveBeenCalledWith(dto);
    expect(result.id).toBe('uuid-1');
  });

  it('should call vehiclesService.findAll on GET /vehicles', () => {
    mockVehiclesService.findAll.mockReturnValue([]);
    expect(controller.findAll()).toEqual([]);
    expect(mockVehiclesService.findAll).toHaveBeenCalledTimes(1);
  });

  it('should call vehiclesService.findOne on GET /vehicles/:id', () => {
    mockVehiclesService.findOne.mockReturnValue({ id: 'uuid-1' });
    expect(controller.findOne('uuid-1')).toEqual({ id: 'uuid-1' });
    expect(mockVehiclesService.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('should call vehiclesService.update on PATCH /vehicles/:id', () => {
    const dto = { nickname: 'Pocket Rocket' };
    mockVehiclesService.update.mockReturnValue({ id: 'uuid-1', ...dto });
    expect(controller.update('uuid-1', dto)).toEqual({ id: 'uuid-1', ...dto });
    expect(mockVehiclesService.update).toHaveBeenCalledWith('uuid-1', dto);
  });

  it('should call vehiclesService.remove on DELETE /vehicles/:id', () => {
    mockVehiclesService.remove.mockReturnValue({ deleted: true, id: 'uuid-1' });
    expect(controller.remove('uuid-1')).toEqual({
      deleted: true,
      id: 'uuid-1',
    });
    expect(mockVehiclesService.remove).toHaveBeenCalledWith('uuid-1');
  });
});

