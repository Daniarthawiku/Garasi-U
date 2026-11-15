import FuelStatusBadge from "../atoms/FuelStatusBadge";

const numberID = new Intl.NumberFormat("id-ID");

/**
 * [Atomic Design: MOLECULE — Fuel Log]
 * FuelLogRow — Migrasi dari baris `<tr>` pada `.bbm-table` menggunakan Atom `FuelStatusBadge`
 * pada `GarasiiU/fuelLog.html` & `GarasiiU/styleB.css`.
 */
export default function FuelLogRow({
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
        <FuelStatusBadge type="distance" label={mileage} />
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
        <span
          className={`font-bold ${
            isOptimalEfficiency ? "text-status-success" : "text-ink-primary"
          }`}
        >
          {typeof efficiency === "number"
            ? efficiency.toFixed(2)
            : efficiency}
        </span>{" "}
        <span className="text-ink-muted">km/L</span>
      </td>
      <td className="px-4 py-3.5 text-center">
        <FuelStatusBadge type="tank" label={status} />
      </td>
    </tr>
  );
}

