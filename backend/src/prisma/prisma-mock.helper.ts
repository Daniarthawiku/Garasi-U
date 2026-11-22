import { randomUUID } from 'node:crypto';
import type {
  FuelLog as PrismaFuelLog,
  ServiceLog as PrismaServiceLog,
  User as PrismaUser,
  Vehicle as PrismaVehicle,
  VehiclePart as PrismaVehiclePart,
} from '@prisma/client';

type VehicleWithParts = PrismaVehicle & { parts: PrismaVehiclePart[] };

export function createInMemoryPrismaMock() {
  const users: PrismaUser[] = [];
  const vehicles: PrismaVehicle[] = [];
  const vehicleParts: PrismaVehiclePart[] = [];
  const serviceLogs: PrismaServiceLog[] = [];
  const fuelLogs: PrismaFuelLog[] = [];
  let nextFuelLogId = 1;

  const attachParts = (vehicle: PrismaVehicle): VehicleWithParts => ({
    ...vehicle,
    parts: vehicleParts.filter((p) => p.vehicleId === vehicle.id),
  });

  return {
    $connect: async () => {},
    $disconnect: async () => {},
    user: {
      findUnique: async ({
        where,
      }: {
        where: { id?: string; email?: string };
      }) => {
        return (
          users.find(
            (u) =>
              (where.id !== undefined && u.id === where.id) ||
              (where.email !== undefined && u.email === where.email),
          ) ?? null
        );
      },
      create: async ({ data }: { data: Partial<PrismaUser> }) => {
        const now = new Date();
        const created: PrismaUser = {
          id: data.id ?? randomUUID(),
          name: data.name ?? '',
          email: data.email ?? '',
          primaryVehicle: data.primaryVehicle ?? null,
          passwordSalt: data.passwordSalt ?? '',
          passwordHash: data.passwordHash ?? '',
          isActive: data.isActive ?? true,
          createdAt: now,
          updatedAt: now,
        };
        users.push(created);
        return created;
      },
    },
    vehicle: {
      findFirst: async ({
        where,
      }: {
        where?: {
          id?: { not?: string };
          plate?: { equals: string; mode?: string };
        };
      }) => {
        return (
          vehicles.find((v) => {
            if (where?.id?.not && v.id === where.id.not) return false;
            if (where?.plate?.equals) {
              if (!v.plate) return false;
              return v.plate.toLowerCase() === where.plate.equals.toLowerCase();
            }
            return true;
          }) ?? null
        );
      },
      create: async ({ data }: { data: Partial<PrismaVehicle> }) => {
        const now = new Date();
        const created: PrismaVehicle = {
          id: data.id ?? randomUUID(),
          userId: data.userId ?? null,
          brand: data.brand ?? '',
          model: data.model ?? '',
          nickname: data.nickname ?? null,
          type: data.type ?? 'CAR',
          year: data.year ?? null,
          plate: data.plate ?? null,
          tankCapacity: data.tankCapacity ?? null,
          initialOdometer: data.initialOdometer ?? 0,
          currentOdometer: data.currentOdometer ?? 0,
          serviceStatus: data.serviceStatus ?? 'NOT_SYNC',
          isActive: data.isActive ?? true,
          lastServiceDate: data.lastServiceDate ?? null,
          createdAt: now,
          updatedAt: now,
        };
        vehicles.push(created);
        return attachParts(created);
      },
      findMany: async () => {
        return vehicles.map((v) => attachParts(v));
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        const found = vehicles.find((v) => v.id === where.id);
        return found ? attachParts(found) : null;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<PrismaVehicle>;
      }) => {
        const idx = vehicles.findIndex((v) => v.id === where.id);
        const current = vehicles[idx];
        const updated: PrismaVehicle = {
          ...current,
          ...data,
          updatedAt: new Date(),
        };
        vehicles[idx] = updated;
        return attachParts(updated);
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = vehicles.findIndex((v) => v.id === where.id);
        const [removed] = vehicles.splice(idx, 1);
        return removed;
      },
      count: async ({
        where,
      }: {
        where?: { serviceStatus?: string; isActive?: boolean; type?: string };
      } = {}) => {
        return vehicles.filter((v) => {
          if (where?.serviceStatus && v.serviceStatus !== where.serviceStatus) {
            return false;
          }
          if (
            where?.isActive !== undefined &&
            v.isActive !== where.isActive
          ) {
            return false;
          }
          if (where?.type && v.type !== where.type) {
            return false;
          }
          return true;
        }).length;
      },
    },
    vehiclePart: {
      create: async ({ data }: { data: Partial<PrismaVehiclePart> }) => {
        const now = new Date();
        const created: PrismaVehiclePart = {
          id: data.id ?? randomUUID(),
          vehicleId: data.vehicleId ?? '',
          name: data.name ?? '',
          intervalKm: data.intervalKm ?? 5000,
          lastServiceOdo: data.lastServiceOdo ?? 0,
          lastServiceDate: data.lastServiceDate ?? now,
          createdAt: now,
          updatedAt: now,
        };
        vehicleParts.push(created);
        return created;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<PrismaVehiclePart>;
      }) => {
        const idx = vehicleParts.findIndex((p) => p.id === where.id);
        const updated: PrismaVehiclePart = {
          ...vehicleParts[idx],
          ...data,
          updatedAt: new Date(),
        };
        vehicleParts[idx] = updated;
        return updated;
      },
      findMany: async ({
        where,
      }: {
        where?: { vehicleId?: string };
      } = {}) => {
        return vehicleParts.filter((p) =>
          where?.vehicleId ? p.vehicleId === where.vehicleId : true,
        );
      },
    },
    serviceLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const now = new Date();
        const created = {
          id: randomUUID(),
          vehicleId: data.vehicleId as string,
          vehiclePartId: (data.vehiclePartId as string | null) ?? null,
          serviceDate: data.serviceDate as Date,
          odometerAtService: data.odometerAtService as number,
          category: data.category as PrismaServiceLog['category'],
          status: data.status as PrismaServiceLog['status'],
          part: data.part as string,
          workshop: data.workshop as string,
          cost: data.cost as unknown as PrismaServiceLog['cost'],
          isWarrantyClaim: (data.isWarrantyClaim as boolean) ?? false,
          notes: (data.notes as string | null) ?? null,
          createdAt: now,
          updatedAt: now,
        } satisfies PrismaServiceLog;
        serviceLogs.push(created);
        return created;
      },
      findMany: async ({
        where,
      }: {
        where?: { vehicleId?: string; category?: string };
      } = {}) => {
        return serviceLogs
          .filter((log) => {
            if (where?.vehicleId && log.vehicleId !== where.vehicleId) {
              return false;
            }
            if (where?.category && log.category !== where.category) {
              return false;
            }
            return true;
          })
          .toSorted(
            (a, b) => b.serviceDate.getTime() - a.serviceDate.getTime(),
          );
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        return serviceLogs.find((log) => log.id === where.id) ?? null;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => {
        const idx = serviceLogs.findIndex((log) => log.id === where.id);
        const updated = {
          ...serviceLogs[idx],
          ...data,
          updatedAt: new Date(),
        } as PrismaServiceLog;
        serviceLogs[idx] = updated;
        return updated;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = serviceLogs.findIndex((log) => log.id === where.id);
        const [removed] = serviceLogs.splice(idx, 1);
        return removed;
      },
      count: async () => serviceLogs.length,
      aggregate: async () => {
        const total = serviceLogs.reduce(
          (acc, item) => acc + Number(item.cost),
          0,
        );
        return { _sum: { cost: total } };
      },
    },
    fuelLog: {
      findFirst: async ({
        where,
      }: {
        where?: { vehicleId?: string; isFullTank?: boolean };
      } = {}) => {
        const matches = fuelLogs
          .filter((log) => {
            if (where?.vehicleId && log.vehicleId !== where.vehicleId) {
              return false;
            }
            if (
              where?.isFullTank !== undefined &&
              log.isFullTank !== where.isFullTank
            ) {
              return false;
            }
            return true;
          })
          .toSorted((a, b) => b.id - a.id);
        return matches[0] ?? null;
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const now = new Date();
        const created = {
          id: nextFuelLogId++,
          vehicleId: data.vehicleId as string,
          fuelType: data.fuelType as string,
          liters: data.liters as number,
          totalCost: data.totalCost as unknown as PrismaFuelLog['totalCost'],
          odometerAtRefuel: data.odometerAtRefuel as number,
          isFullTank: data.isFullTank as boolean,
          fuelEfficiency: (data.fuelEfficiency as number | null) ?? null,
          refuelDate: data.refuelDate as Date,
          createdAt: now,
          updatedAt: now,
        } satisfies PrismaFuelLog;
        fuelLogs.push(created);
        return created;
      },
      findMany: async ({
        where,
      }: {
        where?: { vehicleId?: string };
      } = {}) => {
        return fuelLogs
          .filter((log) =>
            where?.vehicleId ? log.vehicleId === where.vehicleId : true,
          )
          .toSorted((a, b) => b.id - a.id);
      },
      findUnique: async ({ where }: { where: { id: number } }) => {
        return fuelLogs.find((log) => log.id === where.id) ?? null;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: number };
        data: Record<string, unknown>;
      }) => {
        const idx = fuelLogs.findIndex((log) => log.id === where.id);
        const updated = {
          ...fuelLogs[idx],
          ...data,
          updatedAt: new Date(),
        } as PrismaFuelLog;
        fuelLogs[idx] = updated;
        return updated;
      },
      delete: async ({ where }: { where: { id: number } }) => {
        const idx = fuelLogs.findIndex((log) => log.id === where.id);
        const [removed] = fuelLogs.splice(idx, 1);
        return removed;
      },
      count: async () => fuelLogs.length,
      aggregate: async () => {
        const totalCost = fuelLogs.reduce(
          (acc, item) => acc + Number(item.totalCost),
          0,
        );
        const totalLiters = fuelLogs.reduce(
          (acc, item) => acc + Number(item.liters),
          0,
        );
        return { _sum: { totalCost, liters: totalLiters } };
      },
    },
  };
}
