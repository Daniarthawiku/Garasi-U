import Icon from "@/components/shared/atoms/Icon";
import FuelLogRow from "../molecules/FuelLogRow";

/**
 * [Atomic Design: ORGANISM — Fuel Log]
 * FuelLogTable — Migrasi dari `.bbm-table-section`, `.table-header`,
 * `.table-actions`, `.table-filters`, `.btn-export`, `.bbm-table`,
 * `.table-footer`, dan `.pagination` pada `GarasiiU/fuelLog.html` & `GarasiiU/styleB.css`.
 */
export default function FuelLogTable({
  title = "Fuel Log History",
  subtitle = "Back-to-back fuel-up logs that crunch your exact mileage",
  logs = [],
  totalLogsCount = 0,
  activeFilter = "ALL",
  onFilterChange,
  onExportCsv,
  optimalThreshold = 11.5,
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-line-subtle bg-surface-raised">
      <div className="flex flex-col gap-4 border-b border-line-subtle p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xl font-bold text-ink-primary">
              {title}
            </h2>
          </div>
          <p className="font-body text-xs text-ink-muted">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded border border-line-subtle bg-surface-base p-0.5">
            <button
              type="button"
              onClick={() => onFilterChange && onFilterChange("ALL")}
              className={`cursor-pointer rounded px-3 py-1.5 font-mono text-xs transition-colors ${
                activeFilter === "ALL"
                  ? "border border-line-subtle bg-action font-semibold text-surface-overlay"
                  : "border-0 bg-transparent text-ink-secondary hover:text-ink-primary"
              }`}
            >
              ALL ({totalLogsCount})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange && onFilterChange("FULL_TANK")}
              className={`cursor-pointer rounded px-3 py-1.5 font-mono text-xs transition-colors ${
                activeFilter === "FULL_TANK"
                  ? "border border-line-subtle bg-action font-semibold text-surface-overlay"
                  : "border-0 bg-transparent text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Only Full-Tank
            </button>
          </div>

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-line-subtle bg-action px-3 py-1.5 font-mono text-xs font-semibold text-canvas transition-all duration-200 hover:border-line-bright hover:bg-action-hover"
          >
            <Icon name="file_download" size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line-subtle bg-surface-base font-mono text-[11px] tracking-[0.05em] text-ink-muted uppercase">
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Odometer</th>
              <th className="px-4 py-3 font-semibold">Mileage</th>
              <th className="px-4 py-3 font-semibold">Fuel Type</th>
              <th className="px-4 py-3 text-right font-semibold">Volume (L)</th>
              <th className="px-4 py-3 text-right font-semibold">Price (Rp)</th>
              <th className="px-4 py-3 text-right font-semibold">Efficiency</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[13px]">
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center font-mono text-xs text-ink-muted"
                >
                  Belum ada data riwayat pengisian BBM untuk filter ini.
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <FuelLogRow
                  key={log.id}
                  date={log.date}
                  odometer={log.odometer}
                  mileage={log.mileage}
                  fuelType={log.fuelType}
                  fuelOctaneVariant={log.fuelOctaneVariant}
                  volume={log.volume}
                  price={log.price}
                  efficiency={log.efficiency}
                  isOptimalEfficiency={
                    Number(log.efficiency) >= optimalThreshold
                  }
                  status={log.status}
                  isLatest={index === 0}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-line-subtle bg-surface-base px-6 py-4 font-mono text-xs text-ink-muted md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center justify-between gap-4">
          <span>
            Showing <strong className="text-ink-primary">{logs.length}</strong>{" "}
            from <strong className="text-ink-primary">{totalLogsCount}</strong>{" "}
            history log
          </span>
          <div className="inline-flex gap-1">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded border border-line-subtle bg-surface-overlay px-2.5 py-1 font-mono text-ink-muted opacity-50"
            >
              «
            </button>
            <button
              type="button"
              className="cursor-pointer rounded border border-action bg-action px-2.5 py-1 font-mono font-bold text-canvas"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded border border-line-subtle bg-surface-overlay px-2.5 py-1 font-mono text-ink-muted opacity-50"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

