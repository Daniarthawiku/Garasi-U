/**
 * [Atomic Design: ORGANISM — Fuel Log]
 * FuelEfficiencyChart — Migrasi dari `.bbm-chart-section`, `.chart-header`,
 * `.chart-filters`, `.chart-container`, `.y-axis`, `.svg-wrapper`, dan `.x-axis`
 * pada `GarasiiU/fuelLog.html` & `GarasiiU/styleB.css`.
 */
export default function FuelEfficiencyChart({
  title = "Fuel Efficiency Trend",
  subtitle = "How your actual mileage stacks up against factory claims",
  badgeText,
  filters = ["Last 30 days", "3 Month", "All"],
  activeFilter = "Last 30 days",
  onFilterChange,
  yAxisLabels = ["13 km/L", "12 km/L", "11 km/L", "10 km/L"],
  dataPoints = [],
}) {
  const validPoints = dataPoints.filter(
    (d) => typeof d.efficiency === "number" && d.efficiency > 0
  );
  const chartPoints = [...validPoints].reverse();
  const values = chartPoints.map((d) => Number(d.efficiency) || 0);
  const minVal = values.length ? Math.floor(Math.min(...values) - 1) : 10;
  const maxVal = values.length ? Math.ceil(Math.max(...values) + 1) : 13;
  const range = Math.max(maxVal - minVal, 1);

  const svgCoords = chartPoints.map((pt, idx) => {
    const x =
      chartPoints.length > 1
        ? (idx / (chartPoints.length - 1)) * 740 + 30
        : 400;
    const normalized = (Number(pt.efficiency) - minVal) / range;
    const y = 200 - Math.min(Math.max(normalized, 0), 1) * 180;
    return { x, y, ...pt };
  });

  const polylinePoints = svgCoords.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints =
    svgCoords.length > 1
      ? `${svgCoords[0].x},215 ${polylinePoints} ${
          svgCoords[svgCoords.length - 1].x
        },215`
      : "";

  return (
    <section className="rounded-lg border border-line-subtle bg-surface-raised p-6">
      <div className="flex flex-col gap-3 border-b border-line-subtle pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xl font-bold text-ink-primary">
              {title}
            </h2>
            {badgeText && (
              <span className="rounded border border-action/20 bg-action/10 px-3 py-1 font-mono text-xs text-action">
                {badgeText}
              </span>
            )}
          </div>
          <p className="font-body text-xs text-ink-muted">{subtitle}</p>
        </div>

        <div className="inline-flex self-start rounded border border-line-subtle bg-surface-base p-1 sm:self-auto">
          {filters.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterChange && onFilterChange(filter)}
                className={`cursor-pointer rounded px-3 py-1.5 font-mono text-xs transition-colors ${
                  isActive
                    ? "border border-line-subtle bg-action font-semibold text-surface-overlay"
                    : "border-0 bg-transparent text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-8 h-[280px] w-full select-none">
        {/* Y-Axis */}
        <div className="pointer-events-none absolute top-0 bottom-6 left-0 flex w-14 flex-col justify-between font-mono text-[11px] text-ink-muted">
          {yAxisLabels.map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>

        {/* SVG Grid + Trend Line */}
        <div className="absolute top-0 right-2 bottom-6 left-14">
          <svg
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 800 220"
          >
            <defs>
              <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line
              stroke="#263040"
              strokeDasharray="3 3"
              strokeWidth="1"
              x1="0"
              x2="800"
              y1="5"
              y2="5"
            />
            <line
              stroke="#263040"
              strokeDasharray="3 3"
              strokeWidth="1"
              x1="0"
              x2="800"
              y1="75"
              y2="75"
            />
            <line
              stroke="#263040"
              strokeDasharray="3 3"
              strokeWidth="1"
              x1="0"
              x2="800"
              y1="145"
              y2="145"
            />
            <line
              stroke="#263040"
              strokeWidth="1"
              x1="0"
              x2="800"
              y1="215"
              y2="215"
            />

            {areaPoints && (
              <polygon points={areaPoints} fill="url(#fuelGradient)" />
            )}

            {svgCoords.length > 1 && (
              <polyline
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.5"
                points={polylinePoints}
              />
            )}

            {svgCoords.map((pt) => (
              <g key={pt.id}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#0A0D12"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  fill="#F1F5F9"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {Number(pt.efficiency).toFixed(2)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* X-Axis */}
        <div className="absolute right-2 bottom-0 left-14 flex justify-between border-t border-line-subtle pt-2 font-mono text-[11px] text-ink-muted">
          {chartPoints.map((pt, idx) => (
            <span
              key={pt.id || idx}
              className="w-20"
              style={{
                textAlign:
                  idx === 0
                    ? "left"
                    : idx === chartPoints.length - 1
                      ? "right"
                      : "center",
              }}
            >
              {pt.shortDate || pt.date.split(" ").slice(0, 2).join(" ")}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

