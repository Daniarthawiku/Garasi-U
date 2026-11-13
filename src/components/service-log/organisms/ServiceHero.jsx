import Icon from "@/components/shared/atoms/Icon";
import VehicleSelector from "@/components/shared/molecules/VehicleSelector";

/**
 * [Atomic Design: ORGANISM — Service Log]
 * ServiceHero — Migrasi dari hero section `Service History` (Active Vehicle,
 * Time Range, Export PDF / Print, dan + Record Service) pada `GarasiiU/serviceLog.html`.
 */
export default function ServiceHero({
  title = "Service History",
  subtitle = "Your vehicle's digital service passport: every repair and maintenance record, verified in one place",
  vehicles = [],
  selectedVehicleId,
  onVehicleChange,
  timeRanges = ["All Time", "2026", "2025", "Last 6 Months"],
  selectedTimeRange = "All Time",
  onTimeRangeChange,
  onPrint,
  onRecordServiceClick,
  activeVehicleServiceStatus,
}) {
  return (
    <section className="flex flex-col justify-between gap-6 rounded-lg border border-line-subtle bg-surface-raised p-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="m-0 font-heading text-[32px] leading-tight font-bold tracking-heading text-ink-primary">
            {title}
          </h2>
          {activeVehicleServiceStatus && (
            <span className="inline-flex items-center gap-1.5 rounded border border-action/20 bg-action/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-action">
              <Icon name="build_circle" size={14} />
              Vehicle Status: {activeVehicleServiceStatus}
            </span>
          )}
        </div>
        <p className="m-0 font-body text-xs text-ink-secondary">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 print:hidden">
        <VehicleSelector
          id="serviceVehicleSelector"
          label="Active Vehicle"
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectChange={onVehicleChange}
          icon="directions_car"
          className="w-full sm:w-auto sm:min-w-[280px]"
        />

        <div className="flex w-full flex-col sm:w-44">
          <label
            htmlFor="timeRange"
            className="mb-1 font-mono text-[10px] tracking-wider text-ink-muted uppercase"
          >
            Time Range
          </label>
          <div className="relative">
            <select
              id="timeRange"
              value={selectedTimeRange}
              onChange={(e) =>
                onTimeRangeChange && onTimeRangeChange(e.target.value)
              }
              className="w-full cursor-pointer appearance-none rounded border border-line-bright bg-canvas py-2 pr-9 pl-3 font-mono text-[13px] text-ink-primary transition-colors focus:border-action focus:outline-none"
            >
              {timeRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-ink-muted">
              <Icon name="calendar_month" size={18} />
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onPrint}
          title="Print service records"
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-line-subtle bg-surface-overlay px-3 py-2 font-heading text-sm font-semibold text-ink-primary transition-colors hover:border-action sm:w-auto"
        >
          <Icon name="description" size={16} className="text-action" />
          <span>Export PDF / Print</span>
        </button>

        <button
          id="btnShowForm"
          type="button"
          onClick={onRecordServiceClick}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded border-0 bg-action px-3 py-2 font-heading text-sm font-semibold text-canvas transition-all hover:opacity-90 active:scale-95 sm:w-auto"
        >
          <Icon
            name="add_circle"
            size={20}
            className="[font-variation-settings:'FILL'_1]"
          />
          <span>+ Record Service</span>
        </button>
      </div>
    </section>
  );
}

