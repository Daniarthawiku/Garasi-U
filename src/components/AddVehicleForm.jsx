"use client";

import { useState } from "react";

export default function AddVehicleForm({ isOpen = true, onClose, onSubmit }) {

  const [formData, setFormData] = useState({
    nickname: "",
    type: "Car",
    brand: "",
    model: "",
    year: "",
    plate: "",
    tankCapacity: "",
    initialOdometer: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.brand || !formData.model) {
      alert("Please fill in Brand and Model.");
      return;
    }

    const yearFormatted = formData.year
      ? (String(formData.year).includes("-")
          ? formData.year.split("-")[0]
          : formData.year)
      : null;

    const newVehicleData = {
      id: `${formData.brand}-${formData.model}-${Date.now()}`
        .toLowerCase()
        .replace(/\s+/g, "-"),
      name: `${formData.brand} ${formData.model}`.trim(),
      nickname: formData.nickname || null,
      type: formData.type === "Car" ? "Car" : "Motorcycle",
      brand: formData.brand,
      model: formData.model,
      year: yearFormatted,
      engine: null,
      plate: formData.plate.trim() || null,
      odometer: Number(String(formData.initialOdometer).replace(/\./g, "")) || 0,
      tankCapacity: formData.tankCapacity ? Number(formData.tankCapacity) : null,
      fuelEfficiency: null,
      costPerKm: null,
      monthlySpending: 0,
      lastService: null,
      status: { label: "Not Sync", variant: "neutral" },
      parts: [],
    };

    if (onSubmit) {
      onSubmit(newVehicleData);
    }

    setFormData({
      nickname: "",
      type: "Car",
      brand: "",
      model: "",
      year: "",
      plate: "",
      tankCapacity: "",
      initialOdometer: "",
    });

    if (onClose) onClose();
  };

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[430px] rounded-2xl border border-[#263040] bg-[#0A0D12] p-6 shadow-2xl transition-all"
      >
        {/* Modal Header */}
        <div className="mb-5 flex items-center justify-between border-b border-[#263040]/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[#38BDF8]">
              {/* Car Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <path d="M9 17h6" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </span>
            <h2 className="font-heading text-lg font-bold tracking-tight text-slate-100">
              Add New Vehicle
            </h2>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#263040] text-slate-400 transition hover:border-slate-500 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Type */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase">
              Vehicle Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#263040] bg-[#0E131B] p-1">
              <button
                type="button"
                onClick={() => handleTypeSelect("Car")}
                className={`cursor-pointer rounded-md py-2 text-center font-mono text-sm font-semibold transition-all duration-150 ${formData.type === "Car"
                    ? "bg-[#38BDF8] text-[#0A0D12] shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                Car
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect("Motorcycle")}
                className={`cursor-pointer rounded-md py-2 text-center font-mono text-sm font-semibold transition-all duration-150 ${formData.type === "Motorcycle"
                    ? "bg-[#38BDF8] text-[#0A0D12] shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                Motorcycle
              </button>
            </div>
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="brand"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase"
              >
                Brand
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                required
                value={formData.brand}
                onChange={handleChange}
                placeholder="Toyota"
                className="w-full rounded-lg border border-[#263040] bg-[#0E131B] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              />
            </div>
            <div>
              <label
                htmlFor="model"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase"
              >
                Model
              </label>
              <input
                id="model"
                name="model"
                type="text"
                required
                value={formData.model}
                onChange={handleChange}
                placeholder="Yaris E"
                className="w-full rounded-lg border border-[#263040] bg-[#0E131B] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              />
            </div>
          </div>

          {/* Year & License Plate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="year"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase"
              >
                Year
              </label>
              <input
                id="year"
                name="year"
                type="date"
                value={formData.year}
                onChange={handleChange}
                placeholder="2008"
                className="w-full rounded-lg border border-[#263040] bg-[#0E131B] px-3.5 py-2.5 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              />
            </div>
            <div>
              <label
                htmlFor="plate"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase"
              >
                License Plate
              </label>
              <input
                id="plate"
                name="plate"
                type="text"
                value={formData.plate}
                onChange={handleChange}
                placeholder="B 1234 ABC"
                className="w-full rounded-lg border border-[#263040] bg-[#0E131B] px-3.5 py-2.5 font-mono text-sm font-semibold tracking-wider text-[#38BDF8] placeholder:text-slate-600 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              />
            </div>
          </div>

          {/* Tank Capacity & Initial Odometer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="tankCapacity"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase"
              >
                Tank Capacity
              </label>
              <div className="relative">
                <input
                  id="tankCapacity"
                  name="tankCapacity"
                  value={formData.tankCapacity}
                  onChange={handleChange}
                  placeholder="42"
                  className="w-full rounded-lg border border-[#263040] bg-[#0E131B] py-2.5 pr-8 pl-3.5 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-slate-500">
                  L
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="initialOdometer"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase"
              >
                Initial Odometer
              </label>
              <div className="relative">
                <input
                  id="initialOdometer"
                  name="initialOdometer"
                  type="text"
                  value={formData.initialOdometer}
                  onChange={handleChange}
                  placeholder="140.000"
                  className="w-full rounded-lg border border-[#263040] bg-[#0E131B] py-2.5 pr-10 pl-3.5 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-slate-500">
                  km
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#38BDF8] px-4 py-3 font-heading text-sm font-bold text-[#0A0D12] shadow-md shadow-[#38BDF8]/20 transition-all duration-200 hover:bg-[#38BDF8]/90 active:scale-[0.99]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Save New Vehicle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
