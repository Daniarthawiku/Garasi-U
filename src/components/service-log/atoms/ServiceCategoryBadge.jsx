import Icon from "@/components/shared/atoms/Icon";

/**
 * [Atomic Design: ATOM — Service Log]
 * ServiceCategoryBadge — Komponen atom untuk badge kategori servis
 * (`Routine Maintenance` / `Unscheduled Repair`) dan status verifikasi
 * pada `GarasiiU/serviceLog.html` & `GarasiiU/script.js`.
 */
export default function ServiceCategoryBadge({
  category = "Routine Maintenance",
  status,
}) {
  const isRoutine = category === "Routine Maintenance";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {isRoutine ? (
        <span className="inline-flex items-center gap-1.5 rounded border border-status-success/30 bg-status-success/15 px-2.5 py-0.5 font-mono text-[11px] text-status-success">
          <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
          {category}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded border border-status-warning/30 bg-status-warning/15 px-2.5 py-0.5 font-mono text-[11px] text-status-warning">
          <Icon name="warning" size={13} />
          {category}
        </span>
      )}
      {status && (
        <span className="inline-flex items-center rounded border border-line-subtle bg-surface-base px-2 py-0.5 font-mono text-[10px] text-ink-secondary">
          {status}
        </span>
      )}
    </div>
  );
}

