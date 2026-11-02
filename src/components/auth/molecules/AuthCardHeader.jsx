/**
 * [Atomic Design: MOLECULE — Auth]
 * AuthCardHeader — Migrasi dari `.card-header`, `.badge-group`, `.dot`, `.label`, `.gateway`
 * pada `GarasiiU/index.html` & `GarasiiU/style.css`.
 */
export default function AuthCardHeader({
  badgeText = "Welcome Back to Garasiu",
  gatewayText = "APEXLOG // AUTH",
  showDot = true,
}) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-line-subtle pb-3">
      <div className="flex items-center gap-2">
        {showDot && <span className="h-2 w-2 bg-action" aria-hidden="true" />}
        <span className="font-mono text-[11px] font-bold tracking-[0.08em] text-action">
          {badgeText}
        </span>
      </div>
      {gatewayText && (
        <span className="font-mono text-[11px] font-bold tracking-[0.08em] text-ink-muted">
          {gatewayText}
        </span>
      )}
    </div>
  );
}

