import type { FuelLog } from '../../fuel-logs/entities/fuel-log.entity.js';

export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
}

export enum VehicleServiceStatus {
  NOT_SYNC = 'NOT_SYNC',
  HEALTHY = 'HEALTHY',
  SERVICE_SOON = 'SERVICE_SOON',
  NEED_MAINTENANCE = 'NEED_MAINTENANCE',
}

export class VehiclePart {
  id: string;
  vehicleId: string;
  name: string;
  intervalKm: number;
  lastServiceOdo: number;
  lastServiceDate: Date;
  wear: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Vehicle {
  id: string;
  brand: string;
  model: string;
  nickname: string | null;
  type: VehicleType;
  year: number | null;
  plate: string | null;
  tankCapacity: number | null;
  initialOdometer: number;
  currentOdometer: number;
  serviceStatus: VehicleServiceStatus;
  isActive: boolean;
  lastServiceDate: Date | null;
  parts: VehiclePart[];
  fuelLogs?: FuelLog[];
  createdAt: Date;
  updatedAt: Date;
}

