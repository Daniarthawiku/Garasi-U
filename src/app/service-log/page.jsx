"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/shared/organisms/Header";
import ServiceHero from "@/components/service-log/organisms/ServiceHero";
import ServiceSummaryCard from "@/components/service-log/molecules/ServiceSummaryCard";
import ServiceTimelineTable from "@/components/service-log/organisms/ServiceTimelineTable";
import RecordServiceModal from "@/components/service-log/organisms/RecordServiceModal";
import AddVehicleForm from "@/components/shared/organisms/AddVehicleForm";
import Footer from "@/components/shared/organisms/Footer";
import { currentUser, navLinks } from "@/data/garageData";
import { serviceLogsApi, vehiclesApi } from "@/lib/api";

const numberID = new Intl.NumberFormat("id-ID");

const SERVICE_CATEGORIES = [
  { id: "All", label: "All Categories" },
  { id: "Routine Maintenance", label: "Routine Maintenance" },
  { id: "Unscheduled Repair", label: "Unscheduled Repair" },
];

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

  const latestService = filteredHistory[0] || null;

  let mostReplacedName = "-";
  let maxCount = 0;
  let latestWorkshop = "There is no component data in this category";

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
        : "There is no service history in this category",
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
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [serviceLogs, setServiceLogs] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("All Time");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
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
        setServiceLogs([]);
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

  const loadLogsForVehicle = useCallback(async (vehicleId) => {
    if (!vehicleId) {
      setServiceLogs([]);
      return;
    }

    try {
      setErrorMessage("");
      const [updatedVehicle, logs] = await Promise.all([
        vehiclesApi.getOne(vehicleId),
        serviceLogsApi.getAll(vehicleId),
      ]);
      setVehicles((prev) =>
        prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
      );
      setServiceLogs(logs);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to load service history.");
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
          setServiceLogs([]);
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

    async function fetchVehicleLogs() {
      try {
        const [updatedVehicle, logs] = await Promise.all([
          vehiclesApi.getOne(selectedVehicleId),
          serviceLogsApi.getAll(selectedVehicleId),
        ]);
        if (!active) return;
        setVehicles((prev) =>
          prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
        );
        setServiceLogs(logs);
        setErrorMessage("");
      } catch (err) {
        if (!active) return;
        setErrorMessage(err?.message || "Failed to load service history.");
      }
    }

    fetchVehicleLogs();
    return () => {
      active = false;
    };
  }, [selectedVehicleId]);

  const activeVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;

  const filteredRecords = serviceLogs.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesTime =
      selectedTimeRange === "All Time" ||
      selectedTimeRange === "Last 6 Months" ||
      item.date.includes(selectedTimeRange);
    return matchesCategory && matchesTime;
  });

  const summaryCards = buildServiceSummaries(filteredRecords, activeCategory);

  const handleOpenCreateService = () => {
    if (!activeVehicle) {
      setErrorMessage("Please add a vehicle first before recording a service.");
      return;
    }
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (logId) => {
    const target = serviceLogs.find((item) => item.id === logId) || null;
    setEditingService(target);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (servicePayload) => {
    if (!activeVehicle) return;

    if (editingService?.id) {
      await serviceLogsApi.update(editingService.id, servicePayload);
    } else {
      await serviceLogsApi.create(activeVehicle.id, servicePayload);
    }

    await loadLogsForVehicle(activeVehicle.id);
  };

  const handleDeleteService = async (targetId) => {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm("Delete this service history?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      await serviceLogsApi.remove(targetId);
      await loadLogsForVehicle(activeVehicle?.id);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to delete service history.");
    }
  };

  const handleAddVehicle = async (formData) => {
    const createdVehicle = await vehiclesApi.create(formData);
    setVehicles((prev) => [createdVehicle, ...prev]);
    setSelectedVehicleId(createdVehicle.id);
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

        {/* 1. Service Hero */}
        <ServiceHero
          title="Service History"
          subtitle="Your vehicle's digital service passport: every repair and maintenance record, verified in one place"
          vehicles={vehicles}
          selectedVehicleId={activeVehicle?.id || ""}
          onVehicleChange={setSelectedVehicleId}
          timeRanges={["All Time", "2026", "2025", "Last 6 Months"]}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
          onPrint={() => typeof window !== "undefined" && window.print()}
          onRecordServiceClick={handleOpenCreateService}
          activeVehicleServiceStatus={activeVehicle?.serviceStatus}
        />

        {isLoading ? (
          <div className="rounded-xl border border-line-subtle bg-surface-raised/40 py-16 text-center font-mono text-xs text-ink-muted">
            Loading data from the NestJS backend...
          </div>
        ) : !activeVehicle ? (
          <div className="rounded-xl border border-dashed border-line-subtle bg-surface-raised/40 py-16 text-center font-mono text-xs text-ink-muted">
            No vehicles in the garage yet. Click &quot;+ Add New Vehicle&quot; first to start recording service history.
          </div>
        ) : (
          <>
            {/* 2. Service Summary Cards */}
            <section
              aria-label="Service summary metrics"
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              {summaryCards.map(({ id, ...cardProps }) => (
                <ServiceSummaryCard key={id} {...cardProps} />
              ))}
            </section>

            {/* 3. Service Timeline Table */}
            <ServiceTimelineTable
              title="Service Timeline"
              records={filteredRecords}
              totalRecordsCount={serviceLogs.length}
              categories={SERVICE_CATEGORIES}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onEditRecord={handleOpenEditService}
              onDeleteRecord={handleDeleteService}
            />
          </>
        )}
      </main>

      {/* 4. Record / Edit Service Modal */}
      {isServiceModalOpen && (
        <RecordServiceModal
          key={editingService?.id || "new-service"}
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setEditingService(null);
          }}
          onSubmit={handleSaveService}
          vehicleName={activeVehicle?.name}
          initialData={editingService}
        />
      )}

      {/* Add Vehicle Modal */}
      {isVehicleModalOpen && (
        <AddVehicleForm
          key="service-page-new-vehicle"
          isOpen={isVehicleModalOpen}
          onClose={() => setIsVehicleModalOpen(false)}
          onSubmit={handleAddVehicle}
        />
      )}

      <Footer />
    </>
  );
}
