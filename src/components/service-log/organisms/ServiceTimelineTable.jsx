import Icon from "@/components/shared/atoms/Icon";
import ServiceCategoryFilter from "../molecules/ServiceCategoryFilter";
import ServiceTableRow from "../molecules/ServiceTableRow";

/**
 * [Atomic Design: ORGANISM — Service Log]
 * ServiceTimelineTable — Migrasi dari section `Service Timeline` (header,
 * category filter tabs, tabel responsif `#serviceTableBody`, dan pagination footer)
 * pada `GarasiiU/serviceLog.html` & `GarasiiU/script.js`.
 */
export default function ServiceTimelineTable({
  title = "Service Timeline",
  records = [],
  totalRecordsCount = 0,
  categories,
  activeCategory = "All",
  onCategoryChange,
  onDeleteRecord,
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-line-subtle bg-surface-raised">
      <div className="flex flex-col gap-4 border-b border-line-subtle bg-surface-base p-6 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="m-0 flex items-center gap-2 font-heading text-base font-bold tracking-tight text-ink-primary">
          <Icon name="history_edu" size={20} className="text-action" />
          <span>{title}</span>
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <ServiceCategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left align-middle">
          <thead>
            <tr className="border-b border-line-subtle bg-surface-base font-mono text-xs font-semibold tracking-wider text-ink-muted uppercase">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Odometer</th>
              <th className="px-4 py-3">Category &amp; Status</th>
              <th className="min-w-[280px] px-4 py-3">Work &amp; Parts</th>
              <th className="px-4 py-3">Workshop</th>
              <th className="px-4 py-3 text-right">Cost (Rp)</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[13px] text-ink-secondary">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center font-mono text-xs text-ink-muted"
                >
                  Tidak ada data riwayat servis pada kategori ini.
                </td>
              </tr>
            ) : (
              records.map((item) => (
                <ServiceTableRow
                  key={item.id}
                  id={item.id}
                  date={item.date}
                  odo={item.odo}
                  category={item.category}
                  status={item.status}
                  part={item.part}
                  workshop={item.workshop}
                  cost={item.cost}
                  onDelete={onDeleteRecord}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center gap-3 border-t border-line-subtle bg-surface-base px-6 py-4 font-mono text-xs text-ink-muted sm:flex-row sm:justify-between">
        <span>
          Showing <b className="text-ink-primary">{records.length}</b> of{" "}
          <b className="text-ink-primary">{totalRecordsCount}</b> verified
          service entries
        </span>

        <nav aria-label="Service log pages" className="print:hidden">
          <ul className="m-0 flex list-none items-center gap-1 p-0">
            <li>
              <span
                aria-label="Previous"
                className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded border border-line-subtle bg-transparent text-ink-muted opacity-50"
              >
                <Icon name="chevron_left" size={18} />
              </span>
            </li>
            <li>
              <button
                type="button"
                aria-current="page"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-action bg-action font-mono text-[13px] font-bold text-canvas"
              >
                1
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-line-subtle bg-transparent font-mono text-[13px] text-ink-secondary transition-colors hover:bg-surface-overlay hover:text-ink-primary"
              >
                2
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-line-subtle bg-transparent font-mono text-[13px] text-ink-secondary transition-colors hover:bg-surface-overlay hover:text-ink-primary"
              >
                3
              </button>
            </li>
            <li>
              <button
                type="button"
                aria-label="Next"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-line-subtle bg-transparent text-ink-secondary transition-colors hover:bg-surface-overlay hover:text-ink-primary"
              >
                <Icon name="chevron_right" size={18} />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
}

