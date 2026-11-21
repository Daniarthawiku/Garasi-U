"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/shared/organisms/Header";
import DashboardHero from "@/components/dashboard/molecules/DashboardHero";
import MetricWidget from "@/components/dashboard/molecules/MetricWidget";
import VehicleCard from "@/components/dashboard/organisms/VehicleCard";
import AddVehicleForm from "@/components/shared/organisms/AddVehicleForm";
import { getPartStatus } from "@/components/dashboard/atoms/PartProgressBar";
import Footer from "@/components/shared/organisms/Footer";
import { navLinks } from "@/data/garageData";
import { authApi, fuelLogsApi, serviceLogsApi, vehiclesApi } from "@/lib/api";

const numberID = new Intl.NumberFormat("id-ID");

function buildMetrics(
  list = [],
  serviceLogs = [],
  fuelLogs = [],
  currentMonthPrefix = ""
) {
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

  const monthlyServiceLogs = currentMonthPrefix
    ? serviceLogs.filter((log) =>
        String(log.rawDate || "").startsWith(currentMonthPrefix)
      )
    : [];
  const monthlyFuelLogs = currentMonthPrefix
    ? fuelLogs.filter((log) =>
        String(log.rawDate || "").startsWith(currentMonthPrefix)
      )
    : [];

  const monthlySpend =
    monthlyServiceLogs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0) +
    monthlyFuelLogs.reduce((sum, log) => sum + (Number(log.price) || 0), 0);

  const totalSpending =
    serviceLogs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0) +
    fuelLogs.reduce((sum, log) => sum + (Number(log.price) || 0), 0);

  const monthlyRecordsCount = monthlyServiceLogs.length + monthlyFuelLogs.length;

  return {
    overdueCount: overdue.length,
    cards: [
      {
        id: "fleet-units",
        label: "Fleet Units",
        iconType: "fleet",
        iconVariant: "cyan",
        topAccent: "cyan",
        value: list.length,
        unit: list.length === 1 ? "Unit" : "Units",
        badge: { text: types, variant: "neutral" },
        className:
          "bg-gradient-to-b from-[#161B22] to-[#0D1117] xl:col-span-3",
      },
      {
        id: "avg-fuel-efficiency",
        label: "Avg. Fuel Efficiency",
        compactLabel: "Avg. Efficiency",
        iconType: "fuel",
        iconVariant: "cyan",
        value: avgEfficiency.toFixed(2),
        unit: "km/L",
        badge: {
          text:
            validFuelVehicles.length > 0
              ? `${validFuelVehicles.length} unit(s) tracked`
              : "No fuel logs",
          variant: validFuelVehicles.length > 0 ? "optimal" : "neutral",
        },
        className: "xl:col-span-3",
      },
      {
        id: "service-health",
        label: "Service Health",
        iconType: "health",
        iconVariant: overdue.length ? "danger" : "optimal",
        topAccent: overdue.length ? "danger" : "optimal",
        value: overdue.length,
        unit: "Overdue",
        valueVariant: overdue.length ? "danger" : "optimal",
        badge: overdue.length
          ? {
              text: `${overdue[0].vehicle}: ${overdue[0].part}`,
              variant: "danger",
            }
          : {
              text: list.length > 0 ? "Systems nominal" : "No units",
              variant: list.length > 0 ? "optimal" : "neutral",
            },
        className: "xl:col-span-3",
      },
      {
        id: "monthly-spend",
        label: "Monthly Spend",
        iconType: "spend",
        iconVariant: "cyan",
        prefix: "Rp",
        value: numberID.format(monthlySpend),
        badge: {
          text:
            monthlyRecordsCount > 0
              ? `${monthlyServiceLogs.length} Svc | ${monthlyFuelLogs.length} Fuel`
              : totalSpending > 0
                ? `Total: Rp ${numberID.format(totalSpending)}`
                : "0 logs this month",
          variant: monthlySpend > 0 ? "optimal" : "neutral",
        },
        className: "xl:col-span-3",
      },
    ],
  };
}

export default function DashboardPage() {
  const [authUser, setAuthUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [serviceLogs, setServiceLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [currentMonthPrefix, setCurrentMonthPrefix] = useState("");
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
      const now = new Date();
      setCurrentMonthPrefix(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      );
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
        const now = new Date();
        setCurrentMonthPrefix(
          `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        );
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

  const { overdueCount, cards: metrics } = buildMetrics(
    vehiclesWithTelemetry,
    serviceLogs,
    fuelLogs,
    currentMonthPrefix
  );

  return (
    <>
      <Header
        navLinks={navLinks}
        ctaLabel="+ Add Vehicle"
        onCtaClick={handleOpenCreateModal}
      />

      <main className="relative flex-1 overflow-x-clip">
        {/* Ambient radial cyan telemetry glow behind grid */}
        <div
          data-ambient-glow
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[440px] bg-[radial-gradient(ellipse_68%_58%_at_26%_0%,rgba(56,189,248,0.14),rgba(56,189,248,0.04)_52%,transparent_80%)]"
        />

        <div className="relative z-10">
          <DashboardHero
            userName={authUser?.name || "Owner"}
            vehicles={vehiclesWithTelemetry}
            overdueCount={overdueCount}
            isLoading={isLoading}
          />

          {/* Bento Telemetry Strip */}
          <section
            aria-label="Metrics summary"
            className="mx-4 my-5 grid grid-cols-2 gap-3 sm:gap-4 md:mx-14 md:my-6 xl:grid-cols-12 xl:gap-5"
          >
            {metrics.map(({ id, ...metric }) => (
              <MetricWidget key={id} isLoading={isLoading} {...metric} />
            ))}
          </section>

          {/* Action Bar */}
          <div className="mx-4 mb-4 flex items-center justify-between gap-3 text-xs text-ink-muted md:mx-14">
            <span className="font-mono">
              Showing <strong className="text-ink-primary">{vehicles.length}</strong>{" "}
              vehicle(s) from NestJS API
            </span>
            <button
              type="button"
              onClick={loadGarageData}
              className="shrink-0 cursor-pointer whitespace-nowrap rounded border border-line-subtle bg-surface-raised px-2.5 py-1 font-mono text-[11px] text-action transition hover:border-action/40"
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
        </div>
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
