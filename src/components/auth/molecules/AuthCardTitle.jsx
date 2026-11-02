/**
 * [Atomic Design: MOLECULE — Auth]
 * AuthCardTitle — Migrasi dari `.card-title` (`h2` & `p`)
 * pada `GarasiiU/index.html` & `GarasiiU/style.css`.
 */
export default function AuthCardTitle({
  title = "Enter your Garage",
  subtitle = "Access scheduled service history, fuel consumption analytics, and parts wear monitoring.",
}) {
  return (
    <div className="mb-6">
      <h2 className="mb-1 font-heading text-[28px] font-bold tracking-heading text-ink-primary">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-sm text-ink-secondary">{subtitle}</p>
      )}
    </div>
  );
}

