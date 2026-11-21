"use client";

import { useState } from "react";
import Icon from "@/components/shared/atoms/Icon";

const FUEL_TYPES = [
  "Pertalite",
  "Pertamax",
  "Pertamax Green 95",
  "Pertamax Turbo",
  "Shell Super",
  "Shell V-Power",
  "BP 92",
  "BP Ultimate",
  "Dexlite",
  "Pertamina Dex",
];

const EMPTY_FUEL_FORM = {
  date: "",
  odometer: "",
  fuelType: "Pertamax",
  volume: "",
  price: "",
  status: "Full Tank",
};

function getInitialFuelForm(initialData) {
  if (!initialData) return EMPTY_FUEL_FORM;
  return {
    date: initialData.rawDate || "",
    odometer:
      initialData.odometer !== null && initialData.odometer !== undefined
        ? String(initialData.odometer)
        : "",
    fuelType: initialData.fuelType || "Pertamax",
    volume:
      initialData.volume !== null && initialData.volume !== undefined
        ? String(initialData.volume)
        : "",
    price:
      initialData.price !== null && initialData.price !== undefined
        ? String(initialData.price)
        : "",
    status: initialData.status || "Full Tank",
  };
}

/**
 * [Atomic Design: ORGANISM — Fuel Log]
 * AddFuelModal — Modal form for adding and editing fuel fill-up records.
 */
export default function AddFuelModal({
  isOpen = false,
  onClose,
  onSubmit,
  vehicleName = "",
  lastOdometer = 0,
  initialData = null,
}) {
  const isEditMode = Boolean(initialData?.id);
  const [formData, setFormData] = useState(() =>
    getInitialFuelForm(initialData)
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const odoNum = Number(formData.odometer);
    const volNum = Number(formData.volume);
    const priceNum = Number(formData.price);

    if (
      !formData.date ||
      Number.isNaN(odoNum) ||
      odoNum < 0 ||
      !volNum ||
      volNum <= 0 ||
      !priceNum ||
      priceNum < 1000
    ) {
      setErrorMessage(
        "Please fill in all fields (Date, Odometer >= 0, Volume > 0, and Total Price >= Rp 1.000)!"
      );
      return;
    }

    const payload = {
      ...(initialData || {}),
      rawDate: formData.date,
      odometer: odoNum,
      fuelType: formData.fuelType,
      volume: volNum,
      price: priceNum,
      isFullTank: formData.status === "Full Tank",
      status: formData.status,
    };

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      if (onSubmit) {
        await onSubmit(payload);
      }
      setFormData(EMPTY_FUEL_FORM);
      if (onClose) onClose();
    } catch (err) {
      setErrorMessage(err?.message || "Failed to save fuel log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-canvas/80 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-xl rounded-xl border border-line-bright bg-surface-raised p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between border-b border-line-subtle pb-3">
          <div className="flex items-center gap-2">
            <Icon name="local_gas_station" size={20} className="text-action" />
            <h3 className="font-heading text-lg font-bold text-ink-primary">
              {isEditMode ? "Edit Fuel Fill-Up" : "Record Fuel Fill-Up"}{" "}
              {vehicleName ? `— ${vehicleName}` : ""}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded border border-line-subtle p-1 text-ink-secondary hover:border-line-bright hover:text-ink-primary"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded border border-status-danger/40 bg-status-danger/15 p-3 font-mono text-xs text-status-danger">
            <Icon name="error" size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleFormSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div className="flex flex-col">
            <label
              htmlFor="fuelDate"
              className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
            >
              Date
            </label>
            <input
              id="fuelDate"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs text-ink-primary focus:border-action focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="fuelOdometer"
              className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
            >
              Odometer (km)
            </label>
            <input
              id="fuelOdometer"
              name="odometer"
              type="number"
              min="0"
              placeholder={`Example: ${Number(lastOdometer || 0) + 350}`}
              value={formData.odometer}
              onChange={handleChange}
              className="rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs text-ink-primary placeholder:text-ink-muted focus:border-action focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="fuelType"
              className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
            >
              Fuel Type
            </label>
            <select
              id="fuelType"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs text-ink-primary focus:border-action focus:outline-none"
            >
              {FUEL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="fuelStatus"
              className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
            >
              Fill Status
            </label>
            <select
              id="fuelStatus"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs text-ink-primary focus:border-action focus:outline-none"
            >
              <option value="Full Tank">Full Tank</option>
              <option value="Partial Fill">Partial Fill</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="fuelVolume"
              className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
            >
              Volume (Liters)
            </label>
            <input
              id="fuelVolume"
              name="volume"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Example: 32.50"
              value={formData.volume}
              onChange={handleChange}
              className="rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs text-ink-primary placeholder:text-ink-muted focus:border-action focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="fuelPrice"
              className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
            >
              Total Price (Rp)
            </label>
            <input
              id="fuelPrice"
              name="price"
              type="number"
              min="1000"
              placeholder="Example: 422500"
              value={formData.price}
              onChange={handleChange}
              className="rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs text-ink-primary placeholder:text-ink-muted focus:border-action focus:outline-none"
            />
          </div>

          <div className="mt-2 flex justify-end gap-3 border-t border-line-subtle pt-3 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded border border-line-subtle bg-surface-overlay px-4 py-2 font-heading text-sm font-semibold text-ink-secondary transition-colors hover:border-line-bright hover:text-ink-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded border-0 bg-action px-5 py-2 font-heading text-sm font-semibold text-canvas transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="save" size={18} />
              <span>
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Save Changes"
                    : "Save Fuel Log"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
