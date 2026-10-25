const DUE_SOON_THRESHOLD = 75;
const OVERDUE_THRESHOLD = 100;

const STATUS_STYLES = {
  overdue: {
    label: "OVER",
    badge: "text-status-danger bg-status-danger/10 border-status-danger/20",
    bar: "bg-status-danger",
    track: "shadow-glow-danger",
  },
  dueSoon: {
    label: "Due Soon",
    badge: "text-status-warning bg-status-warning/10 border-status-warning/20",
    bar: "bg-status-warning",
    track: "",
  },
  optimal: {
    label: "Optimal",
    badge: "text-status-success bg-status-success/10 border-status-success/20",
    bar: "bg-status-success",
    track: "",
  },
};

/** Tentukan status komponen berdasarkan persentase keausan. */
export function getPartStatus(wear) {
  if (wear >= OVERDUE_THRESHOLD) return "overdue";
  if (wear >= DUE_SOON_THRESHOLD) return "dueSoon";
  return "optimal";
}

/**
 * PartProgressBar — migrasi dari `.component-item` + `.component-progress-*`.
 * Status & warna dihitung otomatis dari `wear`, menggantikan class
 * component-header-1 / -2 / -3 / -1-2 ... yang di-hardcode di HTML lama.
 *
 * @param {string} name     Nama komponen/part (mis. "Shell Helix Engine Oil").
 * @param {number} wear     Persentase keausan (boleh > 100 jika overdue).
 * @param {number} [overKm] Kilometer yang sudah terlewat dari jadwal servis.
 */
export default function PartProgressBar({ name, wear, overKm }) {
  const status = getPartStatus(wear);
  const style = STATUS_STYLES[status];
  const width = Math.min(Math.max(wear, 0), 100);

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-line-subtle bg-surface-overlay/80 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-mono text-[13px] font-semibold">{name}</h4>
        <span
          className={`inline-flex shrink-0 rounded border px-3 py-1 font-mono text-xs ${style.badge}`}
        >
          {style.label}: {wear}% Wear
          {status === "overdue" && overKm ? ` (${overKm} km Off)` : ""}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={`${name} wear`}
        aria-valuenow={wear}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`h-2 w-full overflow-hidden rounded bg-canvas ${style.track}`}
      >
        <div
          className={`h-full transition-[width] duration-300 ease-in-out ${style.bar}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
