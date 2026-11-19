export class FuelLog {
  id: number;
  vehicleId: string;
  fuelType: string;
  liters: number;
  totalCost: number;
  odometerAtRefuel: number;
  isFullTank: boolean;
  fuelEfficiency: number | null;
  refuelDate: string;
  createdAt: Date;
}
