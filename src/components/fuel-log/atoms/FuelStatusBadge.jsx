import Icon from "@/components/shared/atoms/Icon";

/**
 * [Atomic Design: ATOM — Fuel Log]
 * FuelStatusBadge — Komponen atom untuk badge jarak (`.dist-badge`),
 * tipe bahan bakar (`.fuel-badge` + `.dot-accent`/`.dot-warning`),
 * dan status pengisian tangki (`.status-tank.optimal`) pada `GarasiiU/fuelLog.html`.
 */
export default function FuelStatusBadge({
  type = "tank",
  label,
  octaneVariant = "accent",
}) {
  if (type === "distance") {
    return (
      <span className="inline-flex items-center rounded border border-action/20 bg-action/10 px-3 py-1 font-mono font-bold text-action">
        +{typeof label === "number" ? `${label} km` : label}
      </span>
    );
  }

  if (type === "fuel") {
    const dotClass =
      octaneVariant === "warning" ? "bg-status-warning" : "bg-action-accent";
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-ink-muted/20 bg-ink-muted/10 px-3 py-1 font-mono text-xs text-ink-primary">
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded border border-status-success/20 bg-status-success/10 px-3 py-1 font-mono text-xs font-medium text-status-success">
      <Icon name="check" size={13} />
      {label}
    </span>
  );
}

