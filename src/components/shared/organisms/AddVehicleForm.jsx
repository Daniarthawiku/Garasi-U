"use client";

import { useState } from "react";

const EMPTY_FORM = {
  nickname: "",
  type: "Car",
  brand: "",
  model: "",
  year: "",
  plate: "",
  tankCapacity: "",
  initialOdometer: "",
};

function getInitialFormData(initialData) {
  if (!initialData) return EMPTY_FORM;
  return {
    nickname: initialData.nickname || "",
    type: initialData.type === "Motorcycle" ? "Motorcycle" : "Car",
    brand: initialData.brand || "",
    model: initialData.model || "",
    year: initialData.year ? String(initialData.year) : "",
    plate: initialData.plate || "",
    tankCapacity:
      initialData.tankCapacity !== null &&
      initialData.tankCapacity !== undefined
        ? String(initialData.tankCapacity)
        : "",
    initialOdometer:
      initialData.odometer !== null && initialData.odometer !== undefined
        ? String(initialData.odometer)
        : "",
  };
}

/**
 * [Atomic Design: ORGANISM — Shared]
 * AddVehicleForm — Modal form tambah & ubah kendaraan.
 */
export default function AddVehicleForm({
  isOpen = true,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const isEditMode = Boolean(initialData?.id);
  const [formData, setFormData] = useState(() =>
    getInitialFormData(initialData)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.brand.trim() || !formData.model.trim()) {
      setErrorMessage("Brand and Model are required.");
      return;
    }

    const yearFormatted = formData.year
      ? String(formData.year).includes("-")
        ? Number(String(formData.year).split("-")[0])
        : Number(formData.year)
      : null;

    const odometerNumber =
      Number(String(formData.initialOdometer).replace(/\./g, "")) || 0;

    const vehiclePayload = {
      ...(initialData || {}),
      name: `${formData.brand.trim()} ${formData.model.trim()}`.trim(),
      nickname: formData.nickname.trim() || null,
      type: formData.type === "Motorcycle" ? "Motorcycle" : "Car",
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      year: yearFormatted && !Number.isNaN(yearFormatted) ? yearFormatted : null,
      plate: formData.plate.trim() || null,
      odometer: odometerNumber,
      tankCapacity: formData.tankCapacity ? Number(formData.tankCapacity) : null,
    };

    try {
      setIsSubmitting(true);
      if (onSubmit) {
        await onSubmit(vehiclePayload);
      }
      setFormData(EMPTY_FORM);
      if (onClose) onClose();
    } catch (err) {
      setErrorMessage(err?.message || "Failed to save vehicle data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[430px] rounded-2xl border border-line-subtle bg-canvas p-6 shadow-2xl transition-all"
      >
        {/* Modal Header */}
        <div className="mb-5 flex items-center justify-between border-b border-line-subtle/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-action">
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
            <h2 className="font-heading text-lg font-bold tracking-tight text-ink-primary">
              {isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
            </h2>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-line-subtle text-ink-secondary transition hover:border-line-bright hover:text-ink-primary"
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

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-status-danger/40 bg-status-danger/15 p-3 font-mono text-xs text-status-danger">
            {errorMessage}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Type */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-ink-secondary uppercase">
              Vehicle Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-line-subtle bg-surface-base p-1">
              <button
                type="button"
                onClick={() => handleTypeSelect("Car")}
                className={`cursor-pointer rounded-md py-2 text-center font-mono text-sm font-semibold transition-all duration-150 ${
                  formData.type === "Car"
                    ? "bg-action text-canvas shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                Car
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect("Motorcycle")}
                className={`cursor-pointer rounded-md py-2 text-center font-mono text-sm font-semibold transition-all duration-150 ${
                  formData.type === "Motorcycle"
                    ? "bg-action text-canvas shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary"
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
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-ink-secondary uppercase"
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
                className="w-full rounded-lg border border-line-subtle bg-surface-base px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="model"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-ink-secondary uppercase"
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
                className="w-full rounded-lg border border-line-subtle bg-surface-base px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
              />
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label
              htmlFor="nickname"
              className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-ink-secondary uppercase"
            >
              Nickname (Optional)
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="Pocket Rocket"
              className="w-full rounded-lg border border-line-subtle bg-surface-base px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
            />
          </div>

          {/* Year & License Plate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="year"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-ink-secondary uppercase"
              >
                Year
              </label>
              <input
                id="year"
                name="year"
                type="number"
                min="1900"
                max="2100"
                value={formData.year}
                onChange={handleChange}
                placeholder="2022"
                className="w-full rounded-lg border border-line-subtle bg-surface-base px-3.5 py-2.5 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="plate"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-ink-secondary uppercase"
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
                className="w-full rounded-lg border border-line-subtle bg-surface-base px-3.5 py-2.5 font-mono text-sm font-semibold tracking-wider text-action placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
              />
            </div>
          </div>

          {/* Tank Capacity & Initial/Current Odometer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="tankCapacity"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-ink-secondary uppercase"
              >
                Tank Capacity
              </label>
              <div className="relative">
                <input
                  id="tankCapacity"
                  name="tankCapacity"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.tankCapacity}
                  onChange={handleChange}
                  placeholder="42"
                  className="w-full rounded-lg border border-line-subtle bg-surface-base py-2.5 pr-8 pl-3.5 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-ink-muted">
                  L
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="initialOdometer"
                className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-ink-secondary uppercase"
              >
                {isEditMode ? "Current Odometer" : "Initial Odometer"}
              </label>
              <div className="relative">
                <input
                  id="initialOdometer"
                  name="initialOdometer"
                  type="number"
                  min="0"
                  required
                  value={formData.initialOdometer}
                  onChange={handleChange}
                  placeholder="36000"
                  className="w-full rounded-lg border border-line-subtle bg-surface-base py-2.5 pr-10 pl-3.5 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-ink-muted">
                  km
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-action px-4 py-3 font-heading text-sm font-bold text-canvas shadow-md shadow-action/20 transition-all duration-200 hover:bg-action-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
              <span>
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Save Changes"
                    : "Save New Vehicle"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
