"use client";

import { useState } from "react";
import Header from "@/components/shared/organisms/Header";
import FuelHero from "@/components/fuel-log/organisms/FuelHero";
import FuelMetricCard from "@/components/fuel-log/molecules/FuelMetricCard";
import FuelEfficiencyChart from "@/components/fuel-log/organisms/FuelEfficiencyChart";
import FuelLogTable from "@/components/fuel-log/organisms/FuelLogTable";
import AddFuelModal from "@/components/fuel-log/organisms/AddFuelModal";
import AddVehicleForm from "@/components/shared/organisms/AddVehicleForm";
import Footer from "@/components/shared/organisms/Footer";
import {
  navLinks,
  currentUser,
  garageVehiclesData,
} from "@/data/garageData";

const numberID = new Intl.NumberFormat("id-ID");

/**
 * Hitung 3 kartu metrik BBM dari data log kendaraan aktif.
 */
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
        badge: { text: "No records yet", icon: "trending_flat", variant: "neutral" },
      },
      {
        id: "monthly-expenses",
        label: "This Month Expenses",
        icon: "receipt_long",
        iconVariant: "optimal",
        value: "Rp 0",
        valueVariant: "primary",
        subtitle: "0 Times fillin this month",
        badge: { text: "0 liters filled in total", icon: "water_drop", variant: "cyan" },
        footerDate: "Sep 2026",
      },
    ];
  }

  const totalVolume = logs.reduce((acc, item) => acc + Number(item.volume || 0), 0);
  const totalMileage = logs.reduce((acc, item) => acc + Number(item.mileage || 0), 0);
  const totalPrice = logs.reduce((acc, item) => acc + Number(item.price || 0), 0);

  const avgEfficiency =
    logs.reduce((acc, item) => acc + Number(item.efficiency || 0), 0) /
    logs.length;
  const costPerKm = totalMileage > 0 ? Math.round(totalPrice / totalMileage) : 0;

  // Bulan terbaru (Sep 2026) atau 2 entri terbaru
  const recentLogs = logs.filter((l) => l.date.includes("Sep"));
  const activeMonthLogs = recentLogs.length > 0 ? recentLogs : logs.slice(0, 2);
  const monthSpend = activeMonthLogs.reduce(
    (acc, item) => acc + Number(item.price || 0),
    0
  );
  const monthLiters = activeMonthLogs.reduce(
    (acc, item) => acc + Number(item.volume || 0),
    0
  );

  const isOptimal = avgEfficiency >= claimEfficiency - 0.5;

  return [
    {
      id: "fuel-summary",
      label: "Fuel Summary",
      icon: "speed",
      iconVariant: "cyan",
      value: avgEfficiency.toFixed(1),
      unit: "km / Liter",
      valueVariant: "cyan",
      subtitle: "Based on fuel tracking",
      badge: {
        text: isOptimal ? "Optimal" : "Below Claim",
        icon: "check_circle",
        variant: isOptimal ? "optimal" : "warning",
      },
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
        text: "Stable (+Rp 15/km since last month)",
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
      subtitle: `${activeMonthLogs.length} Times fillin this month`,
      badge: {
        text: `${monthLiters.toFixed(1)} liters filled in total`,
        icon: "water_drop",
        variant: "cyan",
      },
      footerDate: "Sep 2026",
    },
  ];
}

export default function FuelLogPage() {
  const [vehicles, setVehicles] = useState(garageVehiclesData);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    garageVehiclesData[0].id
  );
  const [chartFilter, setChartFilter] = useState("Last 30 days");
  const [tableFilter, setTableFilter] = useState("ALL");
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const activeVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const allFuelLogs = activeVehicle?.fuelLogs || [];

  // Filter tabel berdasarkan status Full Tank / ALL
  const filteredTableLogs =
    tableFilter === "FULL_TANK"
      ? allFuelLogs.filter((l) => l.status === "Full Tank")
      : allFuelLogs;

  // Filter chart berdasarkan rentang waktu
  const chartDataPoints =
    chartFilter === "Last 30 days"
      ? allFuelLogs.slice(0, 4)
      : chartFilter === "3 Month"
        ? allFuelLogs.slice(0, 5)
        : allFuelLogs;

  const metrics = buildFuelMetrics(
    allFuelLogs,
    activeVehicle?.claimEfficiency || 11.5
  );

  const handleAddFuelLog = (newFuelEntry) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === activeVehicle.id
          ? {
              ...vehicle,
              odometer: Math.max(vehicle.odometer, newFuelEntry.odometer),
              fuelLogs: [newFuelEntry, ...vehicle.fuelLogs],
            }
          : vehicle
      )
    );
  };

  const handleAddVehicle = (newVehicle) => {
    const formattedVehicle = {
      ...newVehicle,
      category: newVehicle.type,
      serviceStatus: newVehicle.status?.label || "Healthy",
      claimEfficiency: 12.0,
      fuelLogs: [],
      serviceHistory: [],
    };
    setVehicles((prev) => [formattedVehicle, ...prev]);
    setSelectedVehicleId(formattedVehicle.id);
  };

  const handleExportCsv = () => {
    if (!filteredTableLogs.length) return;
    const headers = [
      "Date,Odometer,Mileage,Fuel Type,Volume (L),Price (Rp),Efficiency (km/L),Status",
    ];
    const rows = filteredTableLogs.map(
      (l) =>
        `"${l.date}",${l.odometer},${l.mileage},"${l.fuelType}",${l.volume},${l.price},${l.efficiency},"${l.status}"`
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
        profile={currentUser.avatar}
      />

      <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-14 md:py-8">
        {/* 1. Hero Section (Organism + VehicleSelector Molecule) */}
        <FuelHero
          title="Fuel Analytics"
          description="Spot-on fuel tracking by full-to-full stats and quick odo check-ins"
          vehicles={vehicles}
          selectedVehicleId={activeVehicle?.id}
          onVehicleChange={setSelectedVehicleId}
          actionLabel="+ Update Fuel"
          onAddFuelClick={() => setIsFuelModalOpen(true)}
          activeVehicleServiceStatus={activeVehicle?.serviceStatus}
        />

        {/* 2. Metrics Bento Grid — Mapped via .map() to FuelMetricCard (Molecule) */}
        <section
          aria-label="Fuel analytics metrics"
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {metrics.map(({ id, ...metricProps }) => (
            <FuelMetricCard key={id} {...metricProps} />
          ))}
        </section>

        {/* 3. Fuel Efficiency Trend Chart (Organism) */}
        <FuelEfficiencyChart
          title="Fuel Efficiency Trend"
          subtitle="How your actual mileage stacks up against factory claims"
          badgeText={`${activeVehicle?.name} • Claim ${activeVehicle?.claimEfficiency || 11.5} km/L`}
          filters={["Last 30 days", "3 Month", "All"]}
          activeFilter={chartFilter}
          onFilterChange={setChartFilter}
          yAxisLabels={["13 km/L", "12 km/L", "11 km/L", "10 km/L"]}
          dataPoints={chartDataPoints}
        />

        {/* 4. Fuel Log History Table (Organism + FuelLogRow Molecule mapped via .map()) */}
        <FuelLogTable
          title="Fuel Log History"
          subtitle="Back-to-back fuel-up logs that crunch your exact mileage"
          logs={filteredTableLogs}
          totalLogsCount={allFuelLogs.length}
          activeFilter={tableFilter}
          onFilterChange={setTableFilter}
          onExportCsv={handleExportCsv}
          optimalThreshold={activeVehicle?.claimEfficiency || 11.5}
        />
      </main>

      {/* 5. Add Fuel Modal (Organism) */}
      <AddFuelModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        onSubmit={handleAddFuelLog}
        vehicleName={activeVehicle?.name}
        lastOdometer={activeVehicle?.odometer || 142850}
      />

      {/* Add Vehicle Modal */}
      <AddVehicleForm
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSubmit={handleAddVehicle}
      />

      <Footer />
    </>
  );
}

