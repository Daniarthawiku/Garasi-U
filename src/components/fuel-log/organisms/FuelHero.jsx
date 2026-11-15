import Icon from "@/components/shared/atoms/Icon";
import VehicleSelector from "@/components/shared/molecules/VehicleSelector";

/**
 * [Atomic Design: ORGANISM — Fuel Log]
 * FuelHero — Migrasi dari `.bbm-hero`, `.hero-text`, `.hero-controls`, dan `.btn-action-primary`
 * pada `GarasiiU/fuelLog.html` & `GarasiiU/styleB.css`.
 */
export default function FuelHero({
  title = "Fuel Analytics",
  description = "Spot-on fuel tracking by full-to-full stats and quick odo check-ins",
  vehicles = [],
  selectedVehicleId,
  onVehicleChange,
  actionLabel = "+ Update Fuel",
  onAddFuelClick,
  activeVehicleServiceStatus,
}) {
  return (
    <section className="flex flex-col justify-between gap-6 rounded-lg border border-line-subtle bg-surface-raised p-6 xl:flex-row xl:items-center">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-[32px] leading-[1.2] font-bold tracking-heading text-ink-primary">
            {title}
          </h2>
          {activeVehicleServiceStatus && (
            <span className="inline-flex items-center gap-1.5 rounded border border-action/20 bg-action/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-action">
              <Icon name="verified" size={14} />
              Service: {activeVehicleServiceStatus}
            </span>
          )}
        </div>
        <p className="font-body text-xs text-ink-secondary">{description}</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <VehicleSelector
          label="Available Vehicle"
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectChange={onVehicleChange}
          icon="unfold_more"
        />

        <button
          type="button"
          onClick={onAddFuelClick}
          className="inline-flex cursor-pointer items-center justify-center gap-2 self-end rounded border-0 bg-action px-3 py-2 font-heading text-sm font-semibold text-canvas transition-all duration-200 hover:opacity-90 active:scale-95"
        >
          <Icon
            name="local_gas_station"
            size={18}
            className="[font-variation-settings:'FILL'_1]"
          />
          <span>{actionLabel}</span>
        </button>
      </div>
    </section>
  );
}

