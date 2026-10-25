import Icon from "./Icon";

const ICON_VARIANTS = {
  cyan: "text-action border-action/20 bg-action/5",
  danger: "text-status-danger border-status-danger/20 bg-status-danger/5",
  warning: "text-status-warning border-status-warning/20 bg-status-warning/5",
  optimal: "text-status-success border-status-success/20 bg-status-success/5",
};

const BADGE_VARIANTS = {
  optimal: "bg-status-success/10 border-status-success/20 text-status-success",
  neutral: "bg-ink-muted/10 border-ink-muted/20 text-ink-secondary",
  danger: "bg-status-danger/5 border-status-danger/20 text-status-danger",
  warning: "bg-status-warning/10 border-status-warning/20 text-status-warning",
};

const VALUE_VARIANTS = {
  default: "text-ink-primary",
  danger: "text-status-danger",
  warning: "text-status-warning",
  optimal: "text-status-success",
};


export default function MetricWidget({
  label,
  icon,
  iconVariant = "cyan",
  value,
  prefix,
  unit,
  valueVariant = "default",
  badge,
}) {
  return (
    <article className="group flex min-h-[150px] flex-col justify-between rounded-lg border border-line-subtle bg-surface-raised p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-bright hover:shadow-lg hover:shadow-black/30">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-ink-secondary">
          {label}
        </span>
        <div
          className={`flex items-center justify-center rounded border p-1 transition-transform duration-200 group-hover:scale-110 ${ICON_VARIANTS[iconVariant]}`}
        >
          <Icon name={icon} size={18} />
        </div>
      </div>

      <div className="my-2">
        <h2
          className={`flex items-baseline gap-2 font-mono text-[38px] leading-none ${VALUE_VARIANTS[valueVariant]}`}
        >
          {prefix && (
            <span className="-mr-1 font-mono text-base font-semibold text-ink-secondary">
              {prefix}
            </span>
          )}
          {value}
          {unit && (
            <span className="font-mono text-base font-semibold normal-case text-ink-secondary">
              {unit}
            </span>
          )}
        </h2>
      </div>

      {badge && (
        <div className="mt-4 flex items-center border-t border-line-subtle pt-3">
          <div
            className={`inline-flex items-center gap-1.5 rounded border px-3 py-1 font-mono text-xs ${
              BADGE_VARIANTS[badge.variant ?? "neutral"]
            }`}
          >
            {badge.icon && <Icon name={badge.icon} size={14} />}
            {badge.text}
          </div>
        </div>
      )}
    </article>
  );
}
