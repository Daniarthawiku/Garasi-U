"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/shared/organisms/Header";
import FuelHero from "@/components/fuel-log/organisms/FuelHero";
import FuelMetricCard from "@/components/fuel-log/molecules/FuelMetricCard";
import FuelEfficiencyChart from "@/components/fuel-log/organisms/FuelEfficiencyChart";
import FuelLogTable from "@/components/fuel-log/organisms/FuelLogTable";
import AddFuelModal from "@/components/fuel-log/organisms/AddFuelModal";
import AddVehicleForm from "@/components/shared/organisms/AddVehicleForm";
import Footer from "@/components/shared/organisms/Footer";
import { defaultProfile, navLinks } from "@/data/garageData";
import { fuelLogsApi, vehiclesApi } from "@/lib/api";

const numberID = new Intl.NumberFormat("id-ID");

function buildFuelMetrics(logs = [], claimEfficiency = 11.5) {
  if (!logs.length) {
    return [
      {
        id: "fuel-summary",
        label: "Fuel Summary",
        icon: "speed",
        iconVariant: "cyan",
        value: "0.0",
        unit: "km / Liter",
        valueVariant: "cyan",
        subtitle: "Based on fuel tracking",
        badge: { text: "No Data", icon: "info", variant: "neutral" },
      },
      {
        id: "operating-costs",
        label: "Operating Costs",
        icon: "payments",
        iconVariant: "warning",
        value: "Rp 0",
        unit: "/ km",
        valueVariant: "primary",
        subtitle: "Fuel cost driven",
        badge: {
          text: "No records yet",
          icon: "trending_flat",
          variant: "neutral",
        },
      },
      {
        id: "monthly-expenses",
        label: "This Month Expenses",
        icon: "receipt_long",
        iconVariant: "optimal",
        value: "Rp 0",
        valueVariant: "primary",
        subtitle: "0 Times fill-in this month",
        badge: {
          text: "0 liters filled in total",
          icon: "water_drop",
          variant: "cyan",
        },
        footerDate: "-",
      },
    ];
  }

  const validEfficiencyLogs = logs.filter(
    (item) => typeof item.efficiency === "number" && item.efficiency > 0
  );
  const avgEfficiency =
    validEfficiencyLogs.length > 0
      ? validEfficiencyLogs.reduce((acc, item) => acc + item.efficiency, 0) /
        validEfficiencyLogs.length
      : 0;

  const totalMileage = logs.reduce(
    (acc, item) => acc + Number(item.mileage || 0),
    0
  );
  const totalPriceWithMileage = logs.reduce(
    (acc, item) =>
      typeof item.mileage === "number" && item.mileage > 0
        ? acc + Number(item.price || 0)
        : acc,
    0
  );
  const costPerKm =
    totalMileage > 0 ? Math.round(totalPriceWithMileage / totalMileage) : 0;

  const latestMonthPrefix = logs[0]?.rawDate?.slice(0, 7) || "";
  const activeMonthLogs = latestMonthPrefix
    ? logs.filter((l) => l.rawDate?.startsWith(latestMonthPrefix))
    : logs;
  const monthSpend = activeMonthLogs.reduce(
    (acc, item) => acc + Number(item.price || 0),
    0
  );
  const monthLiters = activeMonthLogs.reduce(
    (acc, item) => acc + Number(item.volume || 0),
    0
  );

  const isOptimal = avgEfficiency >= claimEfficiency - 0.5;
  const latestDateLabel = logs[0]?.date
    ? logs[0].date.split(" ").slice(1).join(" ")
    : "-";

  return [
    {
      id: "fuel-summary",
      label: "Fuel Summary",
      icon: "speed",
      iconVariant: "cyan",
      value: avgEfficiency.toFixed(1),
      unit: "km / Liter",
      valueVariant: "cyan",
      subtitle:
        validEfficiencyLogs.length > 0
          ? "Based on full-to-full tracking"
          : "Need 2 full-tank entries to calculate",
      badge:
        validEfficiencyLogs.length > 0
          ? {
              text: isOptimal ? "Optimal" : "Below Claim",
              icon: "check_circle",
              variant: isOptimal ? "optimal" : "warning",
            }
          : { text: "Baseline Recorded", icon: "info", variant: "neutral" },
    },
    {
      id: "operating-costs",
      label: "Operating Costs",
      icon: "payments",
      iconVariant: "warning",
      value: `Rp ${numberID.format(costPerKm)}`,
      unit: "/ km",
      valueVariant: "primary",
      subtitle: "Fuel cost driven",
      badge: {
        text:
          costPerKm > 0
            ? `Across ${numberID.format(totalMileage)} km tracked`
            : "Record next fill-up for distance",
        icon: "trending_up",
        iconClassName: "text-status-warning",
        variant: "neutral",
      },
    },
    {
      id: "monthly-expenses",
      label: "This Month Expenses",
      icon: "receipt_long",
      iconVariant: "optimal",
      value: `Rp ${numberID.format(monthSpend)}`,
      valueVariant: "primary",
      subtitle: `${activeMonthLogs.length} Times fill-in this period`,
      badge: {
        text: `${monthLiters.toFixed(1)} liters filled in total`,
        icon: "water_drop",
        variant: "cyan",
      },
      footerDate: latestDateLabel,
    },
  ];
}

export default function FuelLogPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [fuelLogs, setFuelLogs] = useState([]);
  const [chartFilter, setChartFilter] = useState("Last 30 days");
  const [tableFilter, setTableFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [editingFuel, setEditingFuel] = useState(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const loadVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const fetchedVehicles = await vehiclesApi.getAll();
      setVehicles(fetchedVehicles);

      if (fetchedVehicles.length > 0) {
        const queryVehicleId =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("vehicleId")
            : null;
        const matched = fetchedVehicles.find((v) => v.id === queryVehicleId);
        setSelectedVehicleId((prev) => {
          if (matched) return matched.id;
          if (prev && fetchedVehicles.some((v) => v.id === prev)) return prev;
          return fetchedVehicles[0].id;
        });
      } else {
        setSelectedVehicleId("");
        setFuelLogs([]);
      }
    } catch (err) {
      setErrorMessage(
        err?.message ||
          "Failed to load vehicle data. Ensure the NestJS backend server is running."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFuelLogsForVehicle = useCallback(async (vehicleId) => {
    if (!vehicleId) {
      setFuelLogs([]);
      return;
    }

    try {
      setErrorMessage("");
      const [updatedVehicle, logs] = await Promise.all([
        vehiclesApi.getOne(vehicleId),
        fuelLogsApi.getAll(vehicleId),
      ]);
      setVehicles((prev) =>
        prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
      );
      setFuelLogs(logs);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to load fuel history.");
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchInitialVehicles() {
      try {
        const fetchedVehicles = await vehiclesApi.getAll();
        if (!active) return;
        setVehicles(fetchedVehicles);
        setErrorMessage("");

        if (fetchedVehicles.length > 0) {
          const queryVehicleId =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("vehicleId")
              : null;
          const matched = fetchedVehicles.find((v) => v.id === queryVehicleId);
          setSelectedVehicleId(matched ? matched.id : fetchedVehicles[0].id);
        } else {
          setSelectedVehicleId("");
          setFuelLogs([]);
        }
      } catch (err) {
        if (!active) return;
        setErrorMessage(
          err?.message ||
            "Failed to load vehicle data. Ensure the NestJS backend server is running."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchInitialVehicles();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedVehicleId) return;
    let active = true;

    async function fetchVehicleFuelLogs() {
      try {
        const [updatedVehicle, logs] = await Promise.all([
          vehiclesApi.getOne(selectedVehicleId),
          fuelLogsApi.getAll(selectedVehicleId),
        ]);
        if (!active) return;
        setVehicles((prev) =>
          prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
        );
        setFuelLogs(logs);
        setErrorMessage("");
      } catch (err) {
        if (!active) return;
        setErrorMessage(err?.message || "Failed to load fuel history.");
      }
    }

    fetchVehicleFuelLogs();
    return () => {
      active = false;
    };
  }, [selectedVehicleId]);

  const activeVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;

  const filteredTableLogs =
    tableFilter === "FULL_TANK"
      ? fuelLogs.filter((l) => l.status === "Full Tank")
      : fuelLogs;

  const chartDataPoints =
    chartFilter === "Last 30 days"
      ? fuelLogs.slice(0, 4)
      : chartFilter === "3 Month"
        ? fuelLogs.slice(0, 5)
        : fuelLogs;

  const metrics = buildFuelMetrics(fuelLogs, 11.5);

  const handleOpenCreateFuel = () => {
    if (!activeVehicle) {
      setErrorMessage("Please add a vehicle first before recording fuel logs.");
      return;
    }
    setEditingFuel(null);
    setIsFuelModalOpen(true);
  };

  const handleOpenEditFuel = (logId) => {
    const target = fuelLogs.find((item) => item.id === logId) || null;
    setEditingFuel(target);
    setIsFuelModalOpen(true);
  };

  const handleSaveFuelLog = async (fuelPayload) => {
    if (!activeVehicle) return;

    if (editingFuel?.id) {
      await fuelLogsApi.update(editingFuel.id, fuelPayload);
    } else {
      await fuelLogsApi.create(activeVehicle.id, fuelPayload);
    }

    await loadFuelLogsForVehicle(activeVehicle.id);
  };

  const handleDeleteFuelLog = async (targetId) => {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm("Delete this fuel log record?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      await fuelLogsApi.remove(targetId);
      await loadFuelLogsForVehicle(activeVehicle?.id);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to delete fuel log.");
    }
  };

  const handleAddVehicle = async (formData) => {
    const createdVehicle = await vehiclesApi.create(formData);
    setVehicles((prev) => [createdVehicle, ...prev]);
    setSelectedVehicleId(createdVehicle.id);
  };

  const handleExportCsv = () => {
    if (!filteredTableLogs.length || !activeVehicle) return;
    const headers = [
      "Date,Odometer,Mileage,Fuel Type,Volume (L),Price (Rp),Efficiency (km/L),Status",
    ];
    const rows = filteredTableLogs.map(
      (l) =>
        `"${l.date}",${l.odometer},${l.mileage ?? ""},${JSON.stringify(l.fuelType)},${l.volume},${l.price},${l.efficiency ?? ""},"${l.status}"`
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `fuel-log-${activeVehicle.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Header
        title="Welcome to GarasiU"
        navLinks={navLinks}
        activeHref="/fuel-log"
        ctaLabel="+ Add New Vehicle"
        onCtaClick={() => setIsVehicleModalOpen(true)}
        profile={defaultProfile}
      />

      <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-14 md:py-8">
        {errorMessage && (
          <div className="flex items-center justify-between rounded-lg border border-status-danger/40 bg-status-danger/15 px-4 py-3 font-mono text-xs text-status-danger">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={loadVehicles}
              className="cursor-pointer rounded border border-status-danger/40 px-2.5 py-1 text-status-danger hover:bg-status-danger hover:text-canvas"
            >
              Refresh
            </button>
          </div>
        )}

        {/* 1. Hero Section */}
        <FuelHero
          title="Fuel Analytics"
          description="Spot-on fuel tracking by full-to-full stats and quick odo check-ins"
          vehicles={vehicles}
          selectedVehicleId={activeVehicle?.id || ""}
          onVehicleChange={setSelectedVehicleId}
          actionLabel="+ Update Fuel"
          onAddFuelClick={handleOpenCreateFuel}
          activeVehicleServiceStatus={activeVehicle?.serviceStatus}
        />

        {isLoading ? (
          <div className="rounded-xl border border-line-subtle bg-surface-raised/40 py-16 text-center font-mono text-xs text-ink-muted">
            Loading data from the NestJS backend...
          </div>
        ) : !activeVehicle ? (
          <div className="rounded-xl border border-dashed border-line-subtle bg-surface-raised/40 py-16 text-center font-mono text-xs text-ink-muted">
            No vehicles in the garage yet. Click &quot;+ Add New Vehicle&quot;
            first to start recording fuel logs.
          </div>
        ) : (
          <>
            {/* 2. Metrics Bento Grid */}
            <section
              aria-label="Fuel analytics metrics"
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              {metrics.map(({ id, ...metricProps }) => (
                <FuelMetricCard key={id} {...metricProps} />
              ))}
            </section>

            {/* 3. Fuel Efficiency Trend Chart */}
            <FuelEfficiencyChart
              title="Fuel Efficiency Trend"
              subtitle="How your actual mileage stacks up against factory claims"
              badgeText={`${activeVehicle.name} • Full-to-Full Analytics`}
              filters={["Last 30 days", "3 Month", "All"]}
              activeFilter={chartFilter}
              onFilterChange={setChartFilter}
              yAxisLabels={["16 km/L", "12 km/L", "8 km/L", "4 km/L"]}
              dataPoints={chartDataPoints}
            />

            {/* 4. Fuel Log History Table */}
            <FuelLogTable
              title="Fuel Log History"
              subtitle="Back-to-back fuel-up logs that crunch your exact mileage"
              logs={filteredTableLogs}
              totalLogsCount={fuelLogs.length}
              activeFilter={tableFilter}
              onFilterChange={setTableFilter}
              onExportCsv={handleExportCsv}
              onEditRecord={handleOpenEditFuel}
              onDeleteRecord={handleDeleteFuelLog}
              optimalThreshold={11.5}
            />
          </>
        )}
      </main>

      {/* 5. Add / Edit Fuel Modal */}
      {isFuelModalOpen && (
        <AddFuelModal
          key={editingFuel?.id || "new-fuel"}
          isOpen={isFuelModalOpen}
          onClose={() => {
            setIsFuelModalOpen(false);
            setEditingFuel(null);
          }}
          onSubmit={handleSaveFuelLog}
          vehicleName={activeVehicle?.name}
          lastOdometer={activeVehicle?.odometer || 0}
          initialData={editingFuel}
        />
      )}

      {/* Add Vehicle Modal */}
      {isVehicleModalOpen && (
        <AddVehicleForm
          key="fuel-page-new-vehicle"
          isOpen={isVehicleModalOpen}
          onClose={() => setIsVehicleModalOpen(false)}
          onSubmit={handleAddVehicle}
        />
      )}

      <Footer />
    </>
  );
}
