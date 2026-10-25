export default function Footer({
  brand = "GARASIU",
  copyright = "© 2026 GARASIU ApexLog Automotive Telemetry & Service Passport Systems.",
}) {
  return (
    <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line-subtle bg-surface-base px-4 py-6 text-center text-ink-muted md:flex-row md:px-14 md:text-left">
      <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
        <span className="font-mono text-[11px] font-bold tracking-widest text-ink-secondary">
          {brand}
        </span>
        <span className="hidden font-light text-line-subtle md:inline">|</span>
        <p className="text-xs text-ink-muted">{copyright}</p>
      </div>
    </footer>
  );
}
