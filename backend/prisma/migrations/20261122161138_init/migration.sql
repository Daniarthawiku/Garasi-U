-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'MOTORCYCLE');

-- CreateEnum
CREATE TYPE "VehicleServiceStatus" AS ENUM ('NOT_SYNC', 'HEALTHY', 'SERVICE_SOON', 'NEED_MAINTENANCE');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('ROUTINE_MAINTENANCE', 'UNSCHEDULED_REPAIR');

-- CreateEnum
CREATE TYPE "ServiceLogStatus" AS ENUM ('VERIFIED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "primaryVehicle" VARCHAR(120),
    "passwordSalt" VARCHAR(64) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "brand" VARCHAR(80) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "nickname" VARCHAR(80),
    "type" "VehicleType" NOT NULL DEFAULT 'CAR',
    "year" SMALLINT,
    "plate" VARCHAR(20),
    "tankCapacity" DOUBLE PRECISION,
    "initialOdometer" INTEGER NOT NULL DEFAULT 0,
    "currentOdometer" INTEGER NOT NULL DEFAULT 0,
    "serviceStatus" "VehicleServiceStatus" NOT NULL DEFAULT 'NOT_SYNC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastServiceDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_parts" (
    "id" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "intervalKm" INTEGER NOT NULL DEFAULT 5000,
    "lastServiceOdo" INTEGER NOT NULL,
    "lastServiceDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_logs" (
    "id" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "vehiclePartId" UUID,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "odometerAtService" INTEGER NOT NULL,
    "category" "ServiceCategory" NOT NULL DEFAULT 'ROUTINE_MAINTENANCE',
    "status" "ServiceLogStatus" NOT NULL DEFAULT 'VERIFIED',
    "part" VARCHAR(150) NOT NULL,
    "workshop" VARCHAR(120) NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "isWarrantyClaim" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_logs" (
    "id" SERIAL NOT NULL,
    "vehicleId" UUID NOT NULL,
    "fuelType" VARCHAR(60) NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "odometerAtRefuel" INTEGER NOT NULL,
    "isFullTank" BOOLEAN NOT NULL DEFAULT true,
    "fuelEfficiency" DOUBLE PRECISION,
    "refuelDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "vehicles_userId_idx" ON "vehicles"("userId");

-- CreateIndex
CREATE INDEX "vehicle_parts_vehicleId_idx" ON "vehicle_parts"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_parts_vehicleId_name_key" ON "vehicle_parts"("vehicleId", "name");

-- CreateIndex
CREATE INDEX "service_logs_vehicleId_serviceDate_idx" ON "service_logs"("vehicleId", "serviceDate" DESC);

-- CreateIndex
CREATE INDEX "fuel_logs_vehicleId_refuelDate_idx" ON "fuel_logs"("vehicleId", "refuelDate" DESC);

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_parts" ADD CONSTRAINT "vehicle_parts_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_vehiclePartId_fkey" FOREIGN KEY ("vehiclePartId") REFERENCES "vehicle_parts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
