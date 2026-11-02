import Icon from "../atoms/Icon";

/**
 * [Atomic Design: MOLECULE — Shared]
 * VehicleSelector — Dropdown pemilih kendaraan aktif pada halaman Log BBM & Log Service.
 */
export default function VehicleSelector({
  id = "vehicleSelector",
  label = "Available Vehicle",
  vehicles = [],
  selectedVehicleId,
  onSelectChange,
  icon = "unfold_more",
  className = "min-w-[280px] sm:min-w-[320px]",
}) {
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <label
        htmlFor={id}
        className="mb-1 font-mono text-[10px] tracking-wider text-ink-muted uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={selectedVehicleId}
          onChange={(e) => onSelectChange && onSelectChange(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded border border-line-bright bg-canvas py-2 pr-9 pl-3 font-mono text-[13px] text-ink-primary transition-colors focus:border-action focus:outline-none"
        >
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.year}) • {v.plate} [{v.category || v.type}]
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-ink-muted">
          <Icon name={icon} size={20} />
        </span>
      </div>
    </div>
  );
}

