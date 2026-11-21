"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/shared/organisms/Header";
import DashboardHero from "@/components/dashboard/molecules/DashboardHero";
import MetricWidget from "@/components/dashboard/molecules/MetricWidget";
import VehicleCard from "@/components/dashboard/organisms/VehicleCard";
import AddVehicleForm from "@/components/shared/organisms/AddVehicleForm";
import { getPartStatus } from "@/components/dashboard/atoms/PartProgressBar";
import Footer from "@/components/shared/organisms/Footer";
import { defaultProfile, navLinks } from "@/data/garageData";
import { authApi, fuelLogsApi, serviceLogsApi, vehiclesApi } from "@/lib/api";

const numberID = new Intl.NumberFormat("id-ID");

function buildMetrics(list = [], serviceLogs = [], fuelLogs = []) {
  const overdue = list.flatMap((v) =>
    (v.parts || [])
      .filter((p) => getPartStatus(p.wear) === "overdue")
      .map((p) => ({ vehicle: v.name, part: p.name }))
  );

  const types =
    list.length > 0
      ? Object.entries(
          list.reduce(
            (acc, v) => ({ ...acc, [v.type]: (acc[v.type] ?? 0) + 1 }),
            {}
          )
        )
          .map(([type, count]) => `${count} ${type}`)
          .join(", ")
      : "No vehicles";

  const validFuelVehicles = list.filter(
    (v) => typeof v.fuelEfficiency === "number" && v.fuelEfficiency > 0
  );
  const avgEfficiency =
    validFuelVehicles.length > 0
      ? validFuelVehicles.reduce((sum, v) => sum + v.fuelEfficiency, 0) /
        validFuelVehicles.length
      : 0;

  const totalSpending =
    serviceLogs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0) +
    fuelLogs.reduce((sum, log) => sum + (Number(log.price) || 0), 0);

  return [
    {
      id: "vehicle-total",
      label: "Vehicle Total",
      icon: "directions_car",
      iconVariant: "cyan",
      value: list.length,
      unit: "Units",
      badge: { text: types, icon: "garage", variant: "neutral" },
    },
    {
      id: "vehicle-status",
      label: "Vehicle Status",
      icon: overdue.length ? "warning" : "verified",
      iconVariant: overdue.length ? "danger" : "optimal",
      value: overdue.length,
      unit: "Components Overdue",
      valueVariant: overdue.length ? "danger" : "optimal",
      badge: overdue.length
        ? {
            text: `${overdue[0].vehicle}: ${overdue[0].part}`,
            icon: "warning",
            variant: "danger",
          }
        : {
            text: "All components healthy",
            icon: "check_circle",
            variant: "optimal",
          },
    },
    {
      id: "fuel-summary",
      label: "Fuel Summary",
      icon: "local_gas_station",
      iconVariant: "cyan",
      value: avgEfficiency.toFixed(2),
      unit: "km/L",
        badge: {
        text: "Average Consumption",
        icon: "local_gas_station",
        variant: "optimal",
      },
    },
    {
      id: "total-spending",
      label: "Total Spendings",
      icon: "receipt_long",
      iconVariant: "cyan",
      prefix: "Rp",
      value: numberID.format(totalSpending),
      badge: {
        text: `${serviceLogs.length} Service • ${fuelLogs.length} Fuel Records`,
        icon: "receipt_long",
        variant: "optimal",
      },
    },
  ];
}

export default function DashboardPage() {
  const [authUser, setAuthUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [serviceLogs, setServiceLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const loadGarageData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const [
        fetchedUser,
        fetchedVehicles,
        fetchedServiceLogs,
        fetchedFuelLogs,
      ] = await Promise.all([
        authApi.me(),
        vehiclesApi.getAll(),
        serviceLogsApi.getAll(),
        fuelLogsApi.getAll(),
      ]);
      setAuthUser(fetchedUser);
      setVehicles(fetchedVehicles);
      setServiceLogs(fetchedServiceLogs);
      setFuelLogs(fetchedFuelLogs);
    } catch (err) {
      setErrorMessage(
        err?.message ||
          "Failed to connect to the NestJS backend. Please ensure the backend server is running on port 4000."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchInitialData() {
      try {
        const [
          fetchedUser,
          fetchedVehicles,
          fetchedServiceLogs,
          fetchedFuelLogs,
        ] = await Promise.all([
          authApi.me(),
          vehiclesApi.getAll(),
          serviceLogsApi.getAll(),
          fuelLogsApi.getAll(),
        ]);
        if (!active) return;
        setAuthUser(fetchedUser);
        setVehicles(fetchedVehicles);
        setServiceLogs(fetchedServiceLogs);
        setFuelLogs(fetchedFuelLogs);
        setErrorMessage("");
      } catch (err) {
        if (!active) return;
        setErrorMessage(
          err?.message ||
            "Failed to connect to the NestJS backend. Please ensure the backend server is running on port 4000."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchInitialData();
    return () => {
      active = false;
    };
  }, []);

  const handleOpenCreateModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicleId) => {
    const target = vehicles.find((v) => v.id === vehicleId) || null;
    setEditingVehicle(target);
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (formData) => {
    if (editingVehicle?.id) {
      const updated = await vehiclesApi.update(editingVehicle.id, formData);
      setVehicles((prev) =>
        prev.map((v) => (v.id === updated.id ? updated : v))
      );
    } else {
      const created = await vehiclesApi.create(formData);
      setVehicles((prev) => [created, ...prev]);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    const target = vehicles.find((v) => v.id === vehicleId);
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        `Delete vehicle "${target?.name || vehicleId}" along with all its service records?`
      );
    if (!confirmed) return;

    try {
      setErrorMessage("");
      await vehiclesApi.remove(vehicleId);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      setServiceLogs((prev) => prev.filter((l) => l.vehicleId !== vehicleId));
      setFuelLogs((prev) => prev.filter((l) => l.vehicleId !== vehicleId));
    } catch (err) {
      setErrorMessage(err?.message || "Failed to delete vehicle.");
    }
  };

  const vehiclesWithTelemetry = vehicles.map((vehicle) => {
    const vFuelLogs = fuelLogs.filter((l) => l.vehicleId === vehicle.id);
    const vServiceLogs = serviceLogs.filter((l) => l.vehicleId === vehicle.id);
    const validEff = vFuelLogs.filter(
      (l) => typeof l.efficiency === "number" && l.efficiency > 0
    );
    const avgFuelEff =
      validEff.length > 0
        ? validEff.reduce((s, l) => s + l.efficiency, 0) / validEff.length
        : null;

    const trackedKm = vFuelLogs.reduce(
      (s, l) => s + (typeof l.mileage === "number" ? l.mileage : 0),
      0
    );
    const totalVehicleSpend =
      vFuelLogs.reduce((s, l) => s + (Number(l.price) || 0), 0) +
      vServiceLogs.reduce((s, l) => s + (Number(l.cost) || 0), 0);
    const estimatedCostPerKm =
      trackedKm > 0 ? Math.round(totalVehicleSpend / trackedKm) : null;

    return {
      ...vehicle,
      fuelEfficiency: avgFuelEff,
      costPerKm: estimatedCostPerKm,
    };
  });

  const metrics = buildMetrics(vehiclesWithTelemetry, serviceLogs, fuelLogs);

  return (
    <>
      <Header
        title="Welcome to GarasiU"
        navLinks={navLinks}
        activeHref="/"
        ctaLabel="+ Add New Vehicle"
        onCtaClick={handleOpenCreateModal}
        profile={defaultProfile}
      />

      <main className="flex-1">
        <DashboardHero
          userName={authUser?.name || "Owner"}
          description="Welcome to GarasiU, your ultimate garage management solution. Keep track of your vehicles, fuel consumption, and service history all in one place."
        />

        {/* Metrics */}
        <section
          aria-label="Metrics summary"
          className="mx-4 my-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mx-14 md:my-8 xl:grid-cols-4"
        >
          {metrics.map(({ id, ...metric }) => (
            <MetricWidget key={id} {...metric} />
          ))}
        </section>

        {/* Action Bar */}
        <div className="mx-4 mb-4 flex items-center justify-between text-xs text-ink-muted md:mx-14">
          <span className="font-mono">
            Showing <strong className="text-ink-primary">{vehicles.length}</strong>{" "}
            vehicle(s) from NestJS API
          </span>
          <button
            type="button"
            onClick={loadGarageData}
            className="cursor-pointer rounded border border-line-subtle bg-surface-raised px-2.5 py-1 font-mono text-[11px] text-action transition hover:border-action/40"
          >
            Refresh Data
          </button>
        </div>

        {errorMessage && (
          <div className="mx-4 mb-6 flex items-center justify-between rounded-lg border border-status-danger/40 bg-status-danger/15 px-4 py-3 font-mono text-xs text-status-danger md:mx-14">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={loadGarageData}
              className="cursor-pointer rounded border border-status-danger/40 px-2.5 py-1 text-status-danger hover:bg-status-danger hover:text-canvas"
            >
              Retry
            </button>
          </div>
        )}

        {/* Conditional Rendering */}
        {isLoading ? (
          <div className="mx-4 my-10 rounded-xl border border-line-subtle bg-surface-raised/40 py-16 text-center font-mono text-xs text-ink-muted md:mx-14">
            Loading vehicle data from the backend...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="mx-4 my-10 rounded-xl border border-dashed border-line-subtle bg-surface-raised/40 py-16 text-center text-gray-500 md:mx-14">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-3 h-10 w-10 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
              />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            <p className="text-base font-medium text-gray-400">
              No vehicle data available yet.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Click &quot;+ Add New Vehicle&quot; to register your first vehicle.
            </p>
          </div>
        ) : (
          <section
            aria-label="Vehicle list"
            className="grid grid-cols-1 gap-6 px-4 md:px-14 lg:grid-cols-2"
          >
            {vehiclesWithTelemetry.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                id={vehicle.id}
                type={vehicle.type}
                name={vehicle.name}
                year={vehicle.year}
                engine={vehicle.engine}
                odometer={vehicle.odometer}
                fuelEfficiency={vehicle.fuelEfficiency}
                costPerKm={vehicle.costPerKm}
                status={vehicle.status}
                parts={vehicle.parts}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteVehicle}
              />
            ))}
          </section>
        )}
      </main>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <AddVehicleForm
          key={editingVehicle?.id || "new-vehicle"}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingVehicle(null);
          }}
          onSubmit={handleSaveVehicle}
          initialData={editingVehicle}
        />
      )}

      <Footer />
    </>
  );
}
