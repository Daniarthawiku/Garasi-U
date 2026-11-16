import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { ServiceCategory } from './entities/service-log.entity.js';
import { ServiceLogsController } from './service-logs.controller.js';
import { ServiceLogsService } from './service-logs.service.js';

describe('ServiceLogsController', () => {
  let controller: ServiceLogsController;

  const mockServiceLogsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceLogsController],
      providers: [
        {
          provide: ServiceLogsService,
          useValue: mockServiceLogsService,
        },
      ],
    }).compile();

    controller = module.get<ServiceLogsController>(ServiceLogsController);
  });

  it('should call serviceLogsService.create on POST /service-logs', () => {
    const dto = {
      vehicleId: 'uuid-vehicle',
      serviceDate: '2026-11-15',
      odometerAtService: 12000,
      category: ServiceCategory.ROUTINE_MAINTENANCE,
      part: 'Engine Oil',
      workshop: 'Prestiges Motocars',
      cost: 500000,
    };
    mockServiceLogsService.create.mockReturnValue({ id: 'uuid-log', ...dto });

    const result = controller.create(dto);
    expect(mockServiceLogsService.create).toHaveBeenCalledWith(dto);
    expect(result.id).toBe('uuid-log');
  });

  it('should call serviceLogsService.findAll on GET /service-logs', () => {
    mockServiceLogsService.findAll.mockReturnValue([]);
    expect(
      controller.findAll('uuid-vehicle', ServiceCategory.ROUTINE_MAINTENANCE),
    ).toEqual([]);
    expect(mockServiceLogsService.findAll).toHaveBeenCalledWith(
      'uuid-vehicle',
      ServiceCategory.ROUTINE_MAINTENANCE,
    );
  });

  it('should call serviceLogsService.findOne on GET /service-logs/:id', () => {
    mockServiceLogsService.findOne.mockReturnValue({ id: 'uuid-log' });
    expect(controller.findOne('uuid-log')).toEqual({ id: 'uuid-log' });
    expect(mockServiceLogsService.findOne).toHaveBeenCalledWith('uuid-log');
  });

  it('should call serviceLogsService.update on PATCH /service-logs/:id', () => {
    const dto = { cost: 750000 };
    mockServiceLogsService.update.mockReturnValue({ id: 'uuid-log', ...dto });
    expect(controller.update('uuid-log', dto)).toEqual({
      id: 'uuid-log',
      ...dto,
    });
    expect(mockServiceLogsService.update).toHaveBeenCalledWith('uuid-log', dto);
  });

  it('should call serviceLogsService.remove on DELETE /service-logs/:id', () => {
    mockServiceLogsService.remove.mockReturnValue({
      deleted: true,
      id: 'uuid-log',
    });
    expect(controller.remove('uuid-log')).toEqual({
      deleted: true,
      id: 'uuid-log',
    });
    expect(mockServiceLogsService.remove).toHaveBeenCalledWith('uuid-log');
  });
});

