export enum ServiceCategory {
  ROUTINE_MAINTENANCE = 'ROUTINE_MAINTENANCE',
  UNSCHEDULED_REPAIR = 'UNSCHEDULED_REPAIR',
}

export enum ServiceLogStatus {
  VERIFIED = 'VERIFIED',
  COMPLETED = 'COMPLETED',
}

export class ServiceLog {
  id: string;
  vehicleId: string;
  vehiclePartId: string | null;
  serviceDate: Date;
  odometerAtService: number;
  category: ServiceCategory;
  status: ServiceLogStatus;
  part: string;
  workshop: string;
  cost: number;
  isWarrantyClaim: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

