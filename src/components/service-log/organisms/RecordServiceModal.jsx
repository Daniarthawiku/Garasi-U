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

export function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    return `${day} ${MONTHS[monthIndex]} ${year}`;
  }
  return dateStr;
}

/**
 * [Atomic Design: ORGANISM — Service Log]
 * RecordServiceModal — Migrasi dari `#formServiceContainer`, `#modalBackdrop`,
 * `#errorMsg`, dan `#serviceForm` pada `GarasiiU/serviceLog.html` & `GarasiiU/script.js`.
 */
export default function RecordServiceModal({
  isOpen = false,
  onClose,
  onSubmit,
  vehicleName = "",
}) {
  const [formData, setFormData] = useState({
    date: "",
    odo: "",
    category: "Routine Maintenance",
    workshop: "",
    part: "",
    cost: "",
  });
  const [showError, setShowError] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setShowError(false);
    if (onClose) onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { date, odo, category, workshop, part, cost } = formData;

    if (
      !date.trim() ||
      !String(odo).trim() ||
      !part.trim() ||
      !workshop.trim() ||
      !String(cost).trim() ||
      Number(cost) <= 0
    ) {
      setShowError(true);
      return;
    }

    const newServiceItem = {
      id: Date.now(),
      date: formatDateDisplay(date.trim()),
      odo: Number(odo),
      category,
      status: "Verified",
      part: part.trim(),
      workshop: workshop.trim(),
      cost: Number(cost),
    };

    if (onSubmit) {
      onSubmit(newServiceItem);
    }

    setFormData({
      date: "",
      odo: "",
      category: "Routine Maintenance",
      workshop: "",
      part: "",
      cost: "",
    });
    setShowError(false);
    if (onClose) onClose();
  };

  return (
    <div
      id="formServiceContainer"
      className="fixed inset-0 z-50 overflow-y-auto bg-canvas/80 backdrop-blur-sm print:hidden"
    >
      <div
        id="modalBackdrop"
        onClick={(e) => e.target.id === "modalBackdrop" && handleCancel()}
        className="flex min-h-full items-center justify-center p-4"
      >
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-2xl rounded-xl border border-line-bright bg-surface-raised p-6 shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between border-b border-line-subtle pb-3">
            <div className="flex items-center gap-2">
              <Icon name="build_circle" size={20} className="text-action" />
              <h3 className="m-0 font-heading text-lg font-bold text-ink-primary">
                Record New Service {vehicleName ? `— ${vehicleName}` : ""}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="cursor-pointer rounded border border-line-subtle p-1 text-ink-secondary hover:border-line-bright hover:text-ink-primary"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {showError && (
            <div
              id="errorMsg"
              className="mb-4 rounded border border-status-danger/40 bg-status-danger/15 p-3 font-mono text-xs text-status-danger"
            >
              <div className="flex items-center gap-2">
                <Icon name="error" size={16} />
                <span>
                  Alert: Please fill in all input fields (Date, Odometer,
                  Category, Component, Workshop, and Cost) correctly!
                </span>
              </div>
            </div>
          )}

          <form
            id="serviceForm"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div className="flex flex-col">
              <label
                htmlFor="inputDate"
                className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
              >
                Date
              </label>
              <input
                type="date"
                id="inputDate"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs text-ink-primary focus:border-action focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="inputOdo"
                className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
              >
                Odometer (km)
              </label>
              <input
                type="number"
                id="inputOdo"
                name="odo"
                value={formData.odo}
                onChange={handleChange}
                placeholder="Example: 145000"
                className="rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs text-ink-primary placeholder:text-ink-muted focus:border-action focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="inputServiceCat"
                className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
              >
                Service Category
              </label>
              <select
                id="inputServiceCat"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs text-ink-primary focus:border-action focus:outline-none"
              >
                <option value="Routine Maintenance">Routine Maintenance</option>
                <option value="Unscheduled Repair">Unscheduled Repair</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="inputWorkshop"
                className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
              >
                Workshop Name
              </label>
              <input
                type="text"
                id="inputWorkshop"
                name="workshop"
                value={formData.workshop}
                onChange={handleChange}
                placeholder="Example: Ambatuning Garage"
                className="rounded border border-line-subtle bg-canvas px-3 py-2 font-body text-xs text-ink-primary placeholder:text-ink-muted focus:border-action focus:outline-none"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label
                htmlFor="inputParts"
                className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
              >
                Parts / Component
              </label>
              <input
                type="text"
                id="inputParts"
                name="part"
                value={formData.part}
                onChange={handleChange}
                placeholder="Example: Engine Oil"
                className="rounded border border-line-subtle bg-canvas px-3 py-2 font-body text-xs text-ink-primary placeholder:text-ink-muted focus:border-action focus:outline-none"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label
                htmlFor="inputCost"
                className="mb-1.5 font-mono text-xs text-ink-secondary uppercase"
              >
                Prices (Rp)
              </label>
              <input
                type="number"
                id="inputCost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="Example: 650000"
                className="rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs text-ink-primary placeholder:text-ink-muted focus:border-action focus:outline-none"
              />
            </div>

            <div className="mt-1 flex justify-end gap-3 border-t border-line-subtle pt-3 md:col-span-2">
              <button
                type="button"
                id="btnCancelForm"
                onClick={handleCancel}
                className="cursor-pointer rounded border border-line-subtle bg-surface-overlay px-4 py-2 font-heading text-sm font-semibold text-ink-secondary transition-colors hover:border-line-bright hover:text-ink-primary"
              >
                Batal
              </button>
              <button
                type="submit"
                id="btnSubmitService"
                className="inline-flex cursor-pointer items-center gap-2 rounded border-0 bg-action px-5 py-2 font-heading text-sm font-semibold text-canvas transition-all hover:opacity-90"
              >
                <Icon name="save" size={18} />
                <span>Simpan Data Servis</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

