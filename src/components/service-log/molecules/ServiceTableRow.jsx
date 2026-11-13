import Icon from "@/components/shared/atoms/Icon";
import ServiceCategoryBadge from "../atoms/ServiceCategoryBadge";

const numberID = new Intl.NumberFormat("id-ID");

/**
 * [Atomic Design: MOLECULE — Service Log]
 * ServiceTableRow — Migrasi dari baris `<tr>` pada `renderTable()` di
 * `GarasiiU/script.js` dan `GarasiiU/serviceLog.html`.
 */
export default function ServiceTableRow({
  id,
  date,
  odo,
  category,
  status = "Verified",
  part,
  workshop,
  cost,
  onDelete,
}) {
  return (
    <tr className="group border-b border-line-subtle transition-colors hover:bg-surface-overlay/60">
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="text-ink-primary">{date}</span>
      </td>

      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="font-semibold text-action">
          {numberID.format(Number(odo) || 0)}
        </span>{" "}
        <span className="text-[11px] text-ink-muted">km</span>
      </td>

      <td className="px-4 py-3.5 whitespace-nowrap">
        <ServiceCategoryBadge category={category} status={status} />
      </td>

      <td className="min-w-[280px] px-4 py-3.5">
        <div className="font-body text-sm font-semibold text-ink-primary transition-colors group-hover:text-action">
          {part}
        </div>
      </td>

      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="font-body font-medium text-ink-primary">{workshop}</div>
      </td>

      <td className="px-4 py-3.5 text-right whitespace-nowrap">
        <div className="font-bold text-ink-primary">
          Rp {numberID.format(Number(cost) || 0)}
        </div>
      </td>

      <td className="px-4 py-3.5 text-center whitespace-nowrap">
        <button
          type="button"
          onClick={() => onDelete && onDelete(id)}
          className="inline-flex cursor-pointer items-center gap-1 rounded border border-status-danger/30 bg-status-danger/15 px-2.5 py-1 font-mono text-xs text-status-danger transition-colors hover:bg-status-danger hover:text-canvas"
        >
          <Icon name="delete" size={14} />
          <span>Hapus</span>
        </button>
      </td>
    </tr>
  );
}

