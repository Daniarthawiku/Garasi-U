"use client";

import { useState } from "react";
import Header from "@/components/Header";
import DashboardHero from "@/components/DashboardHero";
import MetricWidget from "@/components/MetricWidget";
import VehicleCard from "@/components/VehicleCard";
import AddVehicleForm from "@/components/AddVehicleForm";
import { getPartStatus } from "@/components/PartProgressBar";
import Footer from "@/components/Footer";


/* DUMMY */
const navLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Log BBM", href: "/fuel-log" },
  { label: "Log Service", href: "/service-log" },
];

const currentUser = {
  name: "Daniartha",
  avatar: { src: "/img/profile.png", alt: "Profile Photo" },
};

const initialVehicles = [
  {
    id: "aventador-2015",
    type: "Hypercar",
    name: "Lamborghini Aventador LP700-4",
    nickname: "The Bull",
    year: 2015,
    engine: "6.5-liter naturally aspirated V12 with 7-speed Graziano ISR single-clutch",
    plate: "B 700 LMB",
    odometer: 142500,
    fuelEfficiency: 5.2,
    costPerKm: 12000,
    monthlySpending: 3850000,
    lastService: "2026-06-14",
    parts: [
      { id: "oil", name: "Shell Helix Engine Oil", wear: 108, overKm: 45 },
      { id: "coolant", name: "Shell Water Coolant", wear: 25 },
      { id: "brake-fluid", name: "Brembo Brake Fluid", wear: 80 },
    ],
  },
  {
    id: "panigale-v4r-2020",
    type: "Superbike",
    name: "Ducati Panigale V4 R",
    nickname: "Red Rocket",
    year: 2020,
    engine: "998 cc Desmosedici Stradale R 90° V4",
    plate: "D 4 DCT",
    odometer: 18450,
    fuelEfficiency: 15.6,
    costPerKm: 3500,
    monthlySpending: 1250000,
    lastService: "2026-09-02",
    parts: [
      { id: "oil", name: "Shell Advance Engine Oil", wear: 40 },
      { id: "coolant", name: "Motul Inugel Coolant", wear: 35 },
      { id: "chain", name: "DID Racing Chain Kit", wear: 62 },
    ],
  },
  {
    id: "gr-yaris-2022",
    type: "Hot Hatch",
    name: "Toyota GR Yaris",
    nickname: "Pocket Rocket",
    year: 2022,
    engine: "1.6-liter G16E-GTS turbocharged 3-cylinder with GR-Four AWD",
    plate: "F 1618 GRY",
    odometer: 36200,
    fuelEfficiency: 12.4,
    costPerKm: 2100,
    monthlySpending: 950000,
    lastService: "2026-04-21",
    parts: [
      { id: "oil", name: "TRD Engine Oil 0W-20", wear: 78 },
      { id: "brake-pads", name: "Endless Brake Pads", wear: 45 },
      { id: "spark-plug", name: "Denso Iridium Spark Plug", wear: 30 },
    ],
  },
];


/* HELPERS                                                             */


const numberID = new Intl.NumberFormat("id-ID");

function getVehicleStatus(parts = []) {
  if (!parts || !parts.length) {
    return { label: "Not Sync", variant: "neutral" };
  }
  const statuses = parts.map((p) => getPartStatus(p.wear));
  if (statuses.includes("overdue")) return { label: "Need Maintenance", variant: "danger" };
  if (statuses.includes("dueSoon")) return { label: "Service Soon", variant: "warning" };
  return { label: "Healthy", variant: "success" };
}

function buildMetrics(list = []) {
  const overdue = list.flatMap((v) =>
    (v.parts || [])
      .filter((p) => getPartStatus(p.wear) === "overdue")
      .map((p) => ({ vehicle: v.name, part: p.name }))
  );

  const types =
    list.length > 0
      ? Object.entries(
          list.reduce((acc, v) => ({ ...acc, [v.type]: (acc[v.type] ?? 0) + 1 }), {})
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

  const totalSpending = list.reduce((sum, v) => sum + (v.monthlySpending || 0), 0);

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
        ? { text: `${overdue[0].vehicle}: ${overdue[0].part}`, icon: "warning", variant: "danger" }
        : { text: "All components healthy", icon: "check_circle", variant: "optimal" },
    },
    {
      id: "fuel-summary",
      label: "Fuel Summary",
      icon: "local_gas_station",
      iconVariant: "cyan",
      value: avgEfficiency.toFixed(2),
      unit: "km/L",
      badge: { text: "Average Consumption", icon: "local_gas_station", variant: "optimal" },
    },
    {
      id: "total-spending",
      label: "Total Spendings",
      icon: "receipt_long",
      iconVariant: "cyan",
      prefix: "Rp",
      value: numberID.format(totalSpending),
      badge: { text: "Fuel + Tune Up", icon: "receipt_long", variant: "optimal" },
    },
  ];
}


export default function DashboardPage() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddVehicle = (newVehicle) => {
    setVehicles((prevVehicles) => [newVehicle, ...prevVehicles]);
  };

  const metrics = buildMetrics(vehicles);

  return (
    <>
      <Header
        title="Welcome to GarasiU"
        navLinks={navLinks}
        activeHref="/"
        ctaLabel="+ Add New Vehicle"
        onCtaClick={() => setIsModalOpen(true)}
        profile={currentUser.avatar}
      />

      <main className="flex-1">
        <DashboardHero
          userName={currentUser.name}
          description="Welcome to GarasiU, your ultimate garage management solution. Keep track of your vehicles, fuel consumption, and service history all in one place."
        />

        {/* Metrics */}
        <section
          aria-label="Ringkasan metrik"
          className="mx-4 my-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mx-14 md:my-8 xl:grid-cols-4"
        >
          {metrics.map(({ id, ...metric }) => (
            <MetricWidget key={id} {...metric} />
          ))}
        </section>

        {/* Action Bar */}
        <div className="mx-4 mb-4 flex items-center justify-between text-xs text-ink-muted md:mx-14">
          <span className="font-mono">
            Showing <strong className="text-ink-primary">{vehicles.length}</strong> vehicle(s)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVehicles([])}
              className="cursor-pointer rounded border border-line-subtle bg-surface-raised px-2.5 py-1 text-[11px] font-mono text-status-danger hover:border-status-danger/40 transition"
              title="Klik untuk menguji tampilan kosong (Conditional Rendering)"
            >
              Empty Data
            </button>
            <button
              type="button"
              onClick={() => setVehicles(initialVehicles)}
              className="cursor-pointer rounded border border-line-subtle bg-surface-raised px-2.5 py-1 text-[11px] font-mono text-action hover:border-action/40 transition"
              title="Klik untuk memulihkan data dummy"
            >
              Reset Dummy
            </button>
          </div>
        </div>

        {/* Conditional Rendering */}
        {vehicles.length === 0 ? (
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
            aria-label="Daftar kendaraan"
            className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-2 md:px-14"
          >
            {vehicles.map((vehicle) => (
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
                status={getVehicleStatus(vehicle.parts)}
                parts={vehicle.parts}
              />
            ))}
          </section>
        )}
      </main>

      {/* AddVehicleForm */}
      <AddVehicleForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddVehicle}
      />

      <Footer />
    </>
  );
}
