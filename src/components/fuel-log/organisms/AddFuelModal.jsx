"use client";

import { useState } from "react";
import Icon from "@/components/shared/atoms/Icon";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateID(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day} ${MONTHS[parseInt(month, 10) - 1]} ${year}`;
  }
  return dateStr;
}

/**
 * [Atomic Design: ORGANISM — Fuel Log]
 * AddFuelModal — Modal form interaktif untuk tombol `+ Update Fuel` (`openModal()`)
 * pada `GarasiiU/fuelLog.html`.
 */
export default function AddFuelModal({
  isOpen = false,
  onClose,
  onSubmit,
  vehicleName = "",
  lastOdometer = 142850,
}) {
  const [formData, setFormData] = useState({
    date: "",
    odometer: "",
    fuelType: "Pertamax RON 92",
    volume: "",
    price: "",
    status: "Full Tank",
  });
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const odoNum = Number(formData.odometer);
    const volNum = Number(formData.volume);
    const priceNum = Number(formData.price);

    if (!formData.date || !odoNum || !volNum || !priceNum || volNum <= 0) {
      setError(true);
      return;
    }

    const mileageDiff = Math.max(odoNum - lastOdometer, 50);
    const efficiency = Number((mileageDiff / volNum).toFixed(2));
    const formattedDate = formatDateID(formData.date);

    const newLog = {
      id: `fuel-${Date.now()}`,
      date: formattedDate,
      shortDate: formattedDate.split(" ").slice(0, 2).join(" "),
      odometer: odoNum,
      mileage: mileageDiff,
      fuelType: formData.fuelType,
      fuelOctaneVariant: formData.fuelType.includes("90")
        ? "warning"
        : "accent",
      volume: volNum,
      price: priceNum,
      efficiency,
      status: formData.status,
    };

    if (onSubmit) onSubmit(newLog);
    setFormData({
      date: "",
      odometer: "",
      fuelType: "Pertamax RON 92",
      volume: "",
      price: "",
      status: "Full Tank",
    });
    setError(false);
    if (onClose) onClose();
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
              Record Fuel Fill-Up {vehicleName ? `— ${vehicleName}` : ""}
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

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded border border-status-danger/40 bg-status-danger/15 p-3 font-mono text-xs text-status-danger">
            <Icon name="error" size={16} />
            <span>
              Please fill in all fields (Date, Odometer, Volume, and Total
              Price) with valid numbers!
            </span>
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
              placeholder={`Example: ${lastOdometer + 350}`}
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
              <option value="Shell V-Power Nitro+ RON 98">
                Shell V-Power Nitro+ RON 98
              </option>
              <option value="Pertamax Turbo RON 98">
                Pertamax Turbo RON 98
              </option>
              <option value="Pertamax RON 92">Pertamax RON 92</option>
              <option value="Pertalite RON 90">Pertalite RON 90</option>
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
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 rounded border-0 bg-action px-5 py-2 font-heading text-sm font-semibold text-canvas transition-all hover:opacity-90"
            >
              <Icon name="save" size={18} />
              <span>Simpan Log BBM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

