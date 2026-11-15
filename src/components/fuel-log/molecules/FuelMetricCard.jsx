import Icon from "@/components/shared/atoms/Icon";

const ICON_BOX_VARIANTS = {
  cyan: "text-action",
  warning: "text-status-warning",
  optimal: "text-status-success",
  danger: "text-status-danger",
};

const VALUE_VARIANTS = {
  cyan: "text-action text-[38px]",
  primary: "text-ink-primary text-[36px]",
  optimal: "text-status-success text-[36px]",
  warning: "text-status-warning text-[36px]",
};

const BADGE_VARIANTS = {
  optimal:
    "bg-status-success/10 border-status-success/20 text-status-success",
  neutral: "bg-ink-muted/10 border-ink-muted/20 text-ink-secondary",
  cyan: "bg-ink-muted/10 border-ink-muted/20 text-action",
  warning:
    "bg-status-warning/10 border-status-warning/20 text-status-warning",
};

/**
 * [Atomic Design: MOLECULE — Fuel Log]
 * FuelMetricCard — Migrasi dari `.metric-card`, `.metric-header`, `.icon-box`,
 * `.metric-body`, `.metric-footer`, `.status-badge`, dan `.date-text`
 * pada `GarasiiU/fuelLog.html` & `GarasiiU/styleB.css`.
 */
export default function FuelMetricCard({
  label,
  icon = "speed",
  iconVariant = "cyan",
  value,
  unit,
  valueVariant = "primary",
  subtitle,
  badge = { text: "Optimal", icon: "check_circle", variant: "optimal" },
  footerDate,
}) {
  return (
    <article className="flex flex-col justify-between rounded-lg border border-line-subtle bg-surface-raised p-6 transition-colors duration-200 hover:border-line-bright">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold text-ink-secondary uppercase">
          {label}
        </span>
        <div
          className={`flex items-center justify-center rounded border border-line-subtle bg-surface-overlay p-1 ${
            ICON_BOX_VARIANTS[iconVariant] || ICON_BOX_VARIANTS.cyan
          }`}
        >
          <Icon name={icon} size={18} />
        </div>
      </div>

      <div className="my-2">
        <h2
          className={`flex items-baseline gap-2 font-mono leading-none font-bold ${
            VALUE_VARIANTS[valueVariant] || VALUE_VARIANTS.primary
          }`}
        >
          <span>{value}</span>
          {unit && (
            <span className="font-mono text-base font-semibold text-ink-secondary">
              {unit}
            </span>
          )}
        </h2>
        {subtitle && (
          <p className="mt-1 font-body text-xs text-ink-muted">{subtitle}</p>
        )}
      </div>

      <div
        className={`mt-4 flex items-center border-t border-line-subtle pt-3 ${
          footerDate ? "justify-between" : ""
        }`}
      >
        {badge && (
          <div
            className={`inline-flex items-center gap-1.5 rounded border px-3 py-1 font-mono text-xs ${
              BADGE_VARIANTS[badge.variant] || BADGE_VARIANTS.neutral
            }`}
          >
            {badge.icon && (
              <Icon
                name={badge.icon}
                size={14}
                className={badge.iconClassName || ""}
              />
            )}
            <span>{badge.text}</span>
          </div>
        )}
        {footerDate && (
          <span className="font-mono text-[11px] text-ink-muted">
            {footerDate}
          </span>
        )}
      </div>
    </article>
  );
}

