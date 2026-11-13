import Icon from "@/components/shared/atoms/Icon";

const DOT_VARIANTS = {
  cyan: "bg-action",
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
};

const ICON_VARIANTS = {
  cyan: "text-action",
  success: "text-status-success",
  warning: "text-status-warning",
  danger: "text-status-danger",
};

const FOOTER_RIGHT_VARIANTS = {
  default: "text-ink-primary",
  cyan: "text-action font-bold",
  success: "text-status-success",
  warning: "text-status-warning",
  muted: "text-ink-muted",
};

/**
 * [Atomic Design: MOLECULE — Service Log]
 * ServiceSummaryCard — Migrasi dari 3 kartu metrik (`Total Service Spend`,
 * `Last Service`, dan `Most Replaced Part`) pada `GarasiiU/serviceLog.html` & `GarasiiU/script.js`.
 */
export default function ServiceSummaryCard({
  label,
  dotVariant = "cyan",
  icon = "account_balance_wallet",
  iconVariant = "cyan",
  topBadge,
  value,
  valueSize = "text-[32px]",
  subtitle,
  footerLeft,
  footerRight,
  footerRightIcon,
  footerRightVariant = "default",
}) {
  return (
    <article className="flex flex-col justify-between rounded-lg border border-line-subtle bg-surface-raised p-6 transition-colors hover:border-line-bright">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-ink-secondary uppercase">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              DOT_VARIANTS[dotVariant] || DOT_VARIANTS.cyan
            }`}
          />
          {label}
        </span>
        <div
          className={`flex items-center justify-center rounded border border-line-subtle bg-surface-overlay p-1 ${
            ICON_VARIANTS[iconVariant] || ICON_VARIANTS.cyan
          }`}
        >
          <Icon name={icon} size={18} />
        </div>
      </div>

      <div className="my-2">
        {topBadge && (
          <span className="mb-1.5 inline-block shrink-0 rounded border border-status-success/20 bg-status-success/10 px-3 py-1 font-mono text-xs text-status-success">
            {topBadge}
          </span>
        )}
        <div className="flex items-baseline justify-between gap-2">
          <h2
            title={typeof value === "string" ? value : undefined}
            className={`m-0 truncate font-mono leading-tight font-bold tracking-tight text-ink-primary ${valueSize}`}
          >
            {value}
          </h2>
        </div>
        {subtitle && (
          <p
            title={subtitle}
            className="m-0 mt-1 truncate font-body text-xs text-ink-muted"
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3 font-mono text-xs">
        <span className="text-ink-muted">{footerLeft}</span>
        <span
          className={`inline-flex items-center gap-1 ${
            FOOTER_RIGHT_VARIANTS[footerRightVariant] ||
            FOOTER_RIGHT_VARIANTS.default
          }`}
        >
          {footerRightIcon && <Icon name={footerRightIcon} size={13} />}
          {footerRight}
        </span>
      </div>
    </article>
  );
}

