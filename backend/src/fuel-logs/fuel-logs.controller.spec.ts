import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { AuthGuard } from '../auth/auth.guard.js';
import { FuelLogsController } from './fuel-logs.controller.js';
import { FuelLogsService } from './fuel-logs.service.js';

describe('FuelLogsController', () => {
  let controller: FuelLogsController;

  const mockFuelLogsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FuelLogsController],
      providers: [
        {
          provide: FuelLogsService,
          useValue: mockFuelLogsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FuelLogsController>(FuelLogsController);
  });

  it('should call fuelLogsService.create on POST /fuel-logs', () => {
    const dto = {
      vehicleId: '00000000-0000-4000-8000-000000000001',
      fuelType: 'Pertamax',
      liters: 30,
      totalCost: 390000,
      odometerAtRefuel: 10500,
      isFullTank: true,
      refuelDate: '2026-11-19',
    };
    mockFuelLogsService.create.mockReturnValue({ id: 1, ...dto });

    const result = controller.create(dto);
    expect(mockFuelLogsService.create).toHaveBeenCalledWith(dto);
    expect(result.id).toBe(1);
  });

  it('should call fuelLogsService.findAll on GET /fuel-logs', () => {
    mockFuelLogsService.findAll.mockReturnValue([]);
    expect(
      controller.findAll('00000000-0000-4000-8000-000000000001'),
    ).toEqual([]);
    expect(mockFuelLogsService.findAll).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
    );
  });

  it('should call fuelLogsService.findOne on GET /fuel-logs/:id', () => {
    mockFuelLogsService.findOne.mockReturnValue({ id: 1 });
    expect(controller.findOne(1)).toEqual({ id: 1 });
    expect(mockFuelLogsService.findOne).toHaveBeenCalledWith(1);
  });

  it('should call fuelLogsService.update on PATCH /fuel-logs/:id', () => {
    const dto = { totalCost: 410000 };
    mockFuelLogsService.update.mockReturnValue({ id: 1, ...dto });
    expect(controller.update(1, dto)).toEqual({ id: 1, ...dto });
    expect(mockFuelLogsService.update).toHaveBeenCalledWith(1, dto);
  });

  it('should call fuelLogsService.remove on DELETE /fuel-logs/:id', () => {
    mockFuelLogsService.remove.mockReturnValue({
      deleted: true,
      id: 1,
      message: 'Catatan BBM dengan ID 1 berhasil dihapus',
    });
    expect(controller.remove(1)).toEqual({
      deleted: true,
      id: 1,
      message: 'Catatan BBM dengan ID 1 berhasil dihapus',
    });
    expect(mockFuelLogsService.remove).toHaveBeenCalledWith(1);
  });
});
