"use client";

import { useState } from "react";
import Header from "@/components/shared/organisms/Header";
import ServiceHero from "@/components/service-log/organisms/ServiceHero";
import ServiceSummaryCard from "@/components/service-log/molecules/ServiceSummaryCard";
import ServiceTimelineTable from "@/components/service-log/organisms/ServiceTimelineTable";
import RecordServiceModal from "@/components/service-log/organisms/RecordServiceModal";
import AddVehicleForm from "@/components/shared/organisms/AddVehicleForm";
import Footer from "@/components/shared/organisms/Footer";
import {
  navLinks,
  currentUser,
  garageVehiclesData,
} from "@/data/garageData";

const numberID = new Intl.NumberFormat("id-ID");

const SERVICE_CATEGORIES = [
  { id: "All", label: "All Categories" },
  { id: "Routine Maintenance", label: "Routine Maintenance" },
  { id: "Unscheduled Repair", label: "Unscheduled Repair" },
];

/**
 * Bangun 3 kartu ringkasan servis berdasarkan riwayat servis yang terfilter
 * (Migrasi logika dari calculateTotalCost, updateLastServiceCard, dan
 * updateMostReplacedPartCard di GarasiiU/script.js).
 */
function buildServiceSummaries(filteredHistory = [], activeCategory = "All") {
  const categoryLabel =
    activeCategory === "All" ? "All Categories" : activeCategory;

  const totalCost = filteredHistory.reduce(
    (sum, item) => sum + (Number(item.cost) || 0),
    0
  );
  const avgCost =
    filteredHistory.length > 0
      ? Math.round(totalCost / filteredHistory.length)
      : 0;

  // Kartu 2: Last Service
  const latestService = filteredHistory[0] || null;

  // Kartu 3: Most Replaced Part
  let mostReplacedName = "-";
  let maxCount = 0;
  let latestWorkshop = "Tidak ada data komponen pada kategori ini";

  if (filteredHistory.length > 0) {
    const partCounts = {};
    const partOriginalName = {};
    const partLatestRecord = {};

    filteredHistory.forEach((item) => {
      const key = item.part.trim().toLowerCase();
      if (!partCounts[key]) {
        partCounts[key] = 0;
        partOriginalName[key] = item.part.trim();
        partLatestRecord[key] = item;
      }
      partCounts[key] += 1;
    });

    for (const key in partCounts) {
      if (partCounts[key] > maxCount) {
        maxCount = partCounts[key];
        mostReplacedName = partOriginalName[key];
        latestWorkshop = `Replacement at ${partLatestRecord[key].workshop}`;
      }
    }
  }

  return [
    {
      id: "total-service-spend",
      label: "Total Service Spend",
      dotVariant: "cyan",
      icon: "account_balance_wallet",
      iconVariant: "cyan",
      value: `Rp ${numberID.format(totalCost)}`,
      valueSize: "text-[32px]",
      subtitle: `Total cost for ${categoryLabel}`,
      footerLeft: `Avg: Rp ${numberID.format(avgCost)} / entry`,
      footerRight: "Efficient",
      footerRightIcon: "check_circle",
      footerRightVariant: "success",
    },
    {
      id: "last-service",
      label: "Last Service",
      dotVariant: "success",
      icon: "event_available",
      iconVariant: "success",
      value: latestService ? latestService.date : "-",
      valueSize: "text-[32px]",
      subtitle: latestService
        ? `${latestService.workshop} • ${latestService.part}`
        : "Belum ada riwayat servis pada kategori ini",
      footerLeft: "Odometer at service:",
      footerRight: latestService
        ? `${numberID.format(Number(latestService.odo))} km`
        : "0 km",
      footerRightVariant: "cyan",
    },
    {
      id: "most-replaced-part",
      label: "Most Replaced Part",
      dotVariant: "warning",
      icon: "oil_barrel",
      iconVariant: "warning",
      topBadge: `${maxCount}x Replaced`,
      value: mostReplacedName,
      valueSize: "text-2xl",
      subtitle: latestWorkshop,
      footerLeft: "Active category:",
      footerRight: `${categoryLabel} (${filteredHistory.length} records)`,
      footerRightVariant: "default",
    },
  ];
}

export default function ServiceLogPage() {
  const [vehicles, setVehicles] = useState(garageVehiclesData);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    garageVehiclesData[0].id
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState("All Time");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const activeVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const allVehicleServices = activeVehicle?.serviceHistory || [];

  // Filter berdasarkan Time Range & Category
  const filteredRecords = allVehicleServices.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesTime =
      selectedTimeRange === "All Time" ||
      selectedTimeRange === "Last 6 Months" ||
      item.date.includes(selectedTimeRange);
    return matchesCategory && matchesTime;
  });

  const summaryCards = buildServiceSummaries(filteredRecords, activeCategory);

  const handleAddService = (newServiceItem) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === activeVehicle.id
          ? {
              ...vehicle,
              odometer: Math.max(vehicle.odometer, newServiceItem.odo),
              serviceStatus: "Healthy",
              serviceHistory: [newServiceItem, ...vehicle.serviceHistory],
            }
          : vehicle
      )
    );
  };

  const handleDeleteService = (targetId) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === activeVehicle.id
          ? {
              ...vehicle,
              serviceHistory: vehicle.serviceHistory.filter(
                (item) => item.id !== targetId
              ),
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

  return (
    <>
      <Header
        title="Welcome to GarasiU"
        navLinks={navLinks}
        activeHref="/service-log"
        ctaLabel="+ Add New Vehicle"
        onCtaClick={() => setIsVehicleModalOpen(true)}
        profile={currentUser.avatar}
      />

      <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-14 md:py-8">
        {/* 1. Service Hero (Organism + VehicleSelector Molecule) */}
        <ServiceHero
          title="Service History"
          subtitle="Your vehicle's digital service passport: every repair and maintenance record, verified in one place"
          vehicles={vehicles}
          selectedVehicleId={activeVehicle?.id}
          onVehicleChange={setSelectedVehicleId}
          timeRanges={["All Time", "2026", "2025", "Last 6 Months"]}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
          onPrint={() => typeof window !== "undefined" && window.print()}
          onRecordServiceClick={() => setIsServiceModalOpen(true)}
          activeVehicleServiceStatus={activeVehicle?.serviceStatus}
        />

        {/* 2. Service Summary Cards — Mapped via .map() to ServiceSummaryCard (Molecule) */}
        <section
          aria-label="Service summary metrics"
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {summaryCards.map(({ id, ...cardProps }) => (
            <ServiceSummaryCard key={id} {...cardProps} />
          ))}
        </section>

        {/* 3. Service Timeline Table (Organism + ServiceCategoryFilter & ServiceTableRow Molecules mapped via .map()) */}
        <ServiceTimelineTable
          title="Service Timeline"
          records={filteredRecords}
          totalRecordsCount={allVehicleServices.length}
          categories={SERVICE_CATEGORIES}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onDeleteRecord={handleDeleteService}
        />
      </main>

      {/* 4. Record New Service Modal (Organism) */}
      <RecordServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSubmit={handleAddService}
        vehicleName={activeVehicle?.name}
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

