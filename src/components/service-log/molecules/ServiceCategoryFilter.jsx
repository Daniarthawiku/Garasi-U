/**
 * [Atomic Design: MOLECULE — Service Log]
 * ServiceCategoryFilter — Migrasi dari radio tab group filter kategori servis
 * (`All Categories`, `Routine Maintenance`, `Unscheduled Repair`)
 * pada `GarasiiU/serviceLog.html` & `GarasiiU/script.js`.
 */
export default function ServiceCategoryFilter({
  categories = [
    { id: "All", label: "All Categories" },
    { id: "Routine Maintenance", label: "Routine Maintenance" },
    { id: "Unscheduled Repair", label: "Unscheduled Repair" },
  ],
  activeCategory = "All",
  onCategoryChange,
}) {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="inline-flex flex-wrap rounded border border-line-subtle bg-canvas p-0.5"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange && onCategoryChange(cat.id)}
            className={`cursor-pointer rounded px-3 py-1.5 font-mono text-xs transition-colors ${
              isActive
                ? "border border-action/30 bg-action font-semibold text-canvas"
                : "border border-transparent bg-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

