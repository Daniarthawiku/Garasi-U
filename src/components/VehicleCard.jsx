import PartProgressBar from "./PartProgressBar";

const STATUS_BADGE = {
  danger: "text-status-danger bg-status-danger/10 border-status-danger/20",
  warning: "text-status-warning bg-status-warning/10 border-status-warning/20",
  success: "text-status-success bg-status-success/10 border-status-success/20",
  neutral: "text-ink-muted bg-surface-base border-line-subtle",
};

const CARD_ACCENT = {
  danger: "hover:border-status-danger/40",
  warning: "hover:border-status-warning/40",
  success: "hover:border-status-success/40",
  neutral: "hover:border-line-bright",
};

const numberID = new Intl.NumberFormat("id-ID");

function StatBox({ label, value, unit }) {
  const isNotSync = value === null || value === undefined || value === "";

  return (
    <div>
      <span className="font-mono text-[11px] font-bold uppercase text-ink-muted">
        {label}
      </span>
      <div className="flex items-center gap-1 font-mono">
        {isNotSync ? (
          <span className="font-mono text-sm font-semibold italic text-ink-muted">
            not sync
          </span>
        ) : (
          <>
            <h3 className="font-mono text-base text-action">{value}</h3>
            {unit && <p className="text-xs text-action">{unit}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default function VehicleCard({
  id,
  type,
  name,
  year,
  engine,
  odometer,
  fuelEfficiency,
  costPerKm,
  status = { label: "Not Sync", variant: "neutral" },
  parts = [],
}) {
  const currentVariant = status?.variant || "neutral";
  const currentStatusLabel = status?.label || "Not Sync";

  return (
    <article
      id={`vehicle-${id}`}
      className={`flex w-full flex-col gap-4 rounded-lg border-2 border-line-subtle bg-surface-raised p-6 transition-colors duration-300 ${
        CARD_ACCENT[currentVariant] || CARD_ACCENT.neutral
      }`}
    >
      {/* Card header */}
      <section className="border-b border-line-subtle pb-3">
        <div className="flex flex-wrap gap-2 pb-2">
          <span className="inline-flex rounded border border-action/20 bg-action/10 px-3 py-1 font-mono text-xs text-action">
            {type}
          </span>
          <span
            className={`inline-flex rounded border px-3 py-1 font-mono text-xs ${
              STATUS_BADGE[currentVariant] || STATUS_BADGE.neutral
            }`}
          >
            Status: {currentStatusLabel}
          </span>
        </div>
        <h2 className="text-base font-semibold">
          {name} {year ? `(${year})` : ""}
        </h2>
        <p className="text-xs text-ink-secondary">
          {engine ? (
            engine
          ) : (
            <span className="font-mono text-xs italic text-ink-muted">
              not sync
            </span>
          )}
        </p>
      </section>

      {/* Odometer / Fuel / Cost (StatBoxes) */}
      <section className="flex flex-col items-start gap-3 rounded-lg border-2 border-line-subtle bg-surface-base px-[18px] py-3 sm:flex-row sm:items-center sm:justify-between">
        <StatBox
          label="Current Odometer"
          value={
            typeof odometer === "number" && !isNaN(odometer)
              ? numberID.format(odometer)
              : null
          }
          unit="km"
        />
        <StatBox
          label="Fuel Efficiency"
          value={
            typeof fuelEfficiency === "number" && fuelEfficiency > 0
              ? fuelEfficiency.toFixed(1)
              : null
          }
          unit="km/L"
        />
        <StatBox
          label="Estimated Cost"
          value={
            typeof costPerKm === "number" && costPerKm > 0
              ? `Rp ${numberID.format(costPerKm)}`
              : null
          }
          unit="/km"
        />
      </section>

      {/* Component status (Conditional Rendering) */}
      <section className="flex flex-col gap-2">
        <span className="mb-1 font-mono text-[11px] font-bold uppercase text-ink-secondary">
          Component Status
        </span>
        {parts && parts.length > 0 ? (
          parts.map((part) => (
            <PartProgressBar
              key={part.id}
              name={part.name}
              wear={part.wear}
              overKm={part.overKm}
            />
          ))
        ) : (
          <div className="flex items-center justify-between rounded border border-dashed border-line-subtle bg-surface-base/50 px-4 py-3">
            <span className="text-xs text-ink-muted">
              No component service data yet
            </span>
            <span className="font-mono text-xs font-semibold italic text-ink-muted">
              not sync
            </span>
          </div>
        )}
      </section>

      {/* Footer actions */}
      <section className="mt-auto flex flex-col gap-2 border-t border-line-subtle pt-3 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="cursor-pointer rounded border border-line-subtle bg-surface-overlay px-3 py-2 font-heading text-sm font-semibold text-ink-primary transition-all duration-200 hover:border-line-bright active:scale-95"
          >
            Log Service
          </button>
          <button
            type="button"
            className="cursor-pointer rounded border border-line-subtle bg-surface-overlay px-3 py-2 font-heading text-sm font-semibold text-ink-primary transition-all duration-200 hover:border-line-bright active:scale-95"
          >
            Log Fuel
          </button>
        </div>
        <button
          type="button"
          className="cursor-pointer rounded border border-action/20 bg-action/10 px-3 py-2 font-heading text-sm font-semibold text-action transition-all duration-200 hover:bg-action/20 active:scale-95"
        >
          Update Odometer
        </button>
      </section>
    </article>
  );
}
