import Icon from "@/components/shared/atoms/Icon";
import FuelStatusBadge from "../atoms/FuelStatusBadge";

const numberID = new Intl.NumberFormat("id-ID");

/**
 * [Atomic Design: MOLECULE — Fuel Log]
 * FuelLogRow — Table row for a fuel refill entry.
 */
export default function FuelLogRow({
  id,
  date,
  odometer,
  mileage,
  fuelType,
  fuelOctaneVariant = "accent",
  volume,
  price,
  efficiency,
  isOptimalEfficiency = false,
  status = "Full Tank",
  isLatest = false,
  onEdit,
  onDelete,
}) {
  const formattedOdo =
    typeof odometer === "number" ? `${numberID.format(odometer)} km` : odometer;
  const formattedPrice =
    typeof price === "number" ? `Rp ${numberID.format(price)}` : price;
  const formattedVolume =
    typeof volume === "number" ? `${volume.toFixed(2)} L` : volume;

  return (
    <tr className="border-b border-line-subtle transition-colors duration-200 hover:bg-surface-overlay/60">
      <td
        className={`px-4 py-3.5 ${
          isLatest ? "font-bold text-ink-primary" : "text-ink-secondary"
        }`}
      >
        {date}
      </td>
      <td
        className={`px-4 py-3.5 ${
          isLatest ? "text-ink-primary" : "text-ink-secondary"
        }`}
      >
        {formattedOdo}
      </td>
      <td className="px-4 py-3.5">
        {typeof mileage === "number" ? (
          <FuelStatusBadge type="distance" label={mileage} />
        ) : (
          <span className="font-mono text-xs text-ink-muted">-</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <FuelStatusBadge
          type="fuel"
          label={fuelType}
          octaneVariant={fuelOctaneVariant}
        />
      </td>
      <td className="px-4 py-3.5 text-right font-bold text-ink-primary">
        {formattedVolume}
      </td>
      <td className="px-4 py-3.5 text-right text-ink-primary">
        {formattedPrice}
      </td>
      <td className="px-4 py-3.5 text-right">
        {typeof efficiency === "number" ? (
          <>
            <span
              className={`font-bold ${
                isOptimalEfficiency ? "text-status-success" : "text-ink-primary"
              }`}
            >
              {efficiency.toFixed(2)}
            </span>{" "}
            <span className="text-ink-muted">km/L</span>
          </>
        ) : (
          <span className="font-mono text-xs text-ink-muted italic">
            Baseline
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 text-center">
        <FuelStatusBadge type="tank" label={status} />
      </td>
      <td className="px-4 py-3.5 text-center whitespace-nowrap">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit && onEdit(id)}
            className="inline-flex cursor-pointer items-center gap-1 rounded border border-action/30 bg-action/10 px-2.5 py-1 font-mono text-xs text-action transition-colors hover:bg-action hover:text-canvas"
          >
            <Icon name="edit" size={14} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete && onDelete(id)}
            className="inline-flex cursor-pointer items-center gap-1 rounded border border-status-danger/30 bg-status-danger/15 px-2.5 py-1 font-mono text-xs text-status-danger transition-colors hover:bg-status-danger hover:text-canvas"
          >
            <Icon name="delete" size={14} />
            <span>Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
