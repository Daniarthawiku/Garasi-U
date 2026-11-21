const ICON_VARIANTS = {
  cyan: "text-[#38BDF8] border-[#38BDF8]/25 bg-[#38BDF8]/10",
  danger: "text-[#EF4444] border-[#EF4444]/25 bg-[#EF4444]/10",
  warning: "text-[#F59E0B] border-[#F59E0B]/25 bg-[#F59E0B]/10",
  optimal: "text-[#10B981] border-[#10B981]/25 bg-[#10B981]/10",
};

const BADGE_VARIANTS = {
  optimal: "bg-[#10B981]/10 border-[#10B981]/25 text-[#10B981]",
  neutral: "bg-[#0A0D12]/80 border-[#263040] text-[#94A3B8]",
  danger: "bg-[#EF4444]/10 border-[#EF4444]/25 text-[#EF4444]",
  warning: "bg-[#F59E0B]/10 border-[#F59E0B]/25 text-[#F59E0B]",
};

const VALUE_VARIANTS = {
  default: "text-[#F1F5F9]",
  danger: "text-[#EF4444]",
  warning: "text-[#F59E0B]",
  optimal: "text-[#10B981]",
};

const TOP_ACCENT_BARS = {
  cyan: "from-[#38BDF8]/70 via-[#38BDF8]/20 to-transparent",
  optimal: "from-[#10B981]/70 via-[#10B981]/20 to-transparent",
  danger: "from-[#EF4444]/80 via-[#EF4444]/25 to-transparent",
  warning: "from-[#F59E0B]/75 via-[#F59E0B]/20 to-transparent",
  none: "",
};

function TelemetryIcon({ type }) {
  if (type === "fuel") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
      >
        <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14" />
        <path d="M3 20h13" />
        <path d="M7 8h5" />
        <path d="M15 9h2a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2v0a1 1 0 0 0 1-1V9.5L19.5 7" />
      </svg>
    );
  }

  if (type === "health") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
      >
        <path d="M12 3l7 3v6c0 4.5-3 7.9-7 9-4-1.1-7-4.5-7-9V6l7-3Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }

  if (type === "spend") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="7" y1="15" x2="11" y2="15" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
    >
      <path d="M19 16h1.5a1.5 1.5 0 0 0 1.5-1.5v-2.2a2 2 0 0 0-1.3-1.9L18 9.4l-2.2-2.7A2 2 0 0 0 14.2 6H7.8a2 2 0 0 0-1.7 1L4.2 10.2A3 3 0 0 0 3 12.6v1.9A1.5 1.5 0 0 0 4.5 16H6" />
      <circle cx="8" cy="16.5" r="1.75" />
      <circle cx="16.5" cy="16.5" r="1.75" />
      <path d="M9.75 16.5h5" />
    </svg>
  );
}

/**
 * [Atomic Design: MOLECULE - Dashboard]
 * MetricWidget - Bento telemetry KPI card with inline SVG telemetry icons and responsive sizing.
 */
export default function MetricWidget({
  label,
  compactLabel,
  iconType = "fleet",
  iconVariant = "cyan",
  topAccent = "none",
  value,
  prefix,
  unit,
  valueVariant = "default",
  badge,
  isLoading = false,
  className = "",
}) {
  const accentGradient = TOP_ACCENT_BARS[topAccent] || "";

  return (
    <article
      className={`group relative flex min-h-[132px] flex-col justify-between overflow-hidden rounded-xl border border-[#263040] bg-[#161B22] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3B475C] hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)] motion-reduce:transition-none sm:min-h-[148px] sm:p-5 ${className}`}
    >
      {accentGradient && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${accentGradient}`}
        />
      )}

      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <span className="truncate font-mono text-[9.5px] font-bold tracking-[0.04em] text-[#94A3B8] uppercase sm:text-[11px] sm:tracking-[0.1em]">
          {compactLabel ? (
            <>
              <span className="sm:hidden">{compactLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </>
          ) : (
            label
          )}
        </span>
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none sm:h-7 sm:w-7 ${
            ICON_VARIANTS[iconVariant] || ICON_VARIANTS.cyan
          }`}
        >
          <TelemetryIcon type={iconType} />
        </div>
      </div>

      <div className="my-2 sm:my-3">
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded-md bg-[#263040]/70 motion-reduce:animate-none" />
        ) : (
          <h2
            className={`flex flex-wrap items-baseline gap-1.5 font-mono text-2xl font-bold leading-none tracking-tight sm:text-[30px] xl:text-[34px] ${
              VALUE_VARIANTS[valueVariant] || VALUE_VARIANTS.default
            }`}
          >
            {prefix && (
              <span className="font-mono text-sm font-semibold text-[#94A3B8] sm:text-base">
                {prefix}
              </span>
            )}
            <span>{value}</span>
            {unit && (
              <span className="font-mono text-xs font-medium text-[#94A3B8] normal-case sm:text-sm">
                {unit}
              </span>
            )}
          </h2>
        )}
      </div>

      {badge && (
        <div className="mt-auto border-t border-[#263040]/80 pt-2">
          <div
            className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-md border px-2 py-1 font-mono text-[9.5px] font-medium sm:px-2.5 sm:text-[11px] ${
              BADGE_VARIANTS[badge.variant ?? "neutral"]
            }`}
            title={badge.text}
          >
            <span className="truncate">{badge.text}</span>
          </div>
        </div>
      )}
    </article>
  );
}
