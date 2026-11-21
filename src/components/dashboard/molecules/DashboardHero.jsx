const numberID = new Intl.NumberFormat("id-ID");

function buildStatusBrief({ vehicleCount, totalOdometer, overdueCount, isLoading }) {
  if (isLoading) {
    return "Syncing live garage telemetry, odometer logs, and component health.";
  }
  if (vehicleCount === 0) {
    return "Garage standby: add your first vehicle to unlock live fuel and service telemetry.";
  }
  const unitLabel = vehicleCount === 1 ? "vehicle" : "vehicles";
  const formattedOdo = numberID.format(totalOdometer);
  if (overdueCount > 0) {
    const itemLabel = overdueCount === 1 ? "component" : "components";
    return `Tracking ${vehicleCount} ${unitLabel} (${formattedOdo} km total) with ${overdueCount} overdue ${itemLabel}.`;
  }
  return `Tracking ${vehicleCount} ${unitLabel} across ${formattedOdo} km combined odometer; all systems nominal.`;
}

/**
 * [Atomic Design: MOLECULE - Dashboard]
 * DashboardHero - Cockpit HUD hero with live telemetry status pill,
 * tight-tracked greeting, and dynamic garage status brief.
 */
export default function DashboardHero({
  userName = "Owner",
  vehicles = [],
  overdueCount = 0,
  isLoading = false,
}) {
  const vehicleCount = vehicles.length;
  const totalOdometer = vehicles.reduce(
    (sum, v) => sum + (Number(v.odometer) || 0),
    0
  );

  const statusBrief = buildStatusBrief({
    vehicleCount,
    totalOdometer,
    overdueCount,
    isLoading,
  });

  const statusDotClass =
    overdueCount > 0
      ? "bg-[#F59E0B]"
      : vehicleCount > 0
        ? "bg-[#10B981]"
        : "bg-[#38BDF8]";

  return (
    <section
      aria-label="Cockpit summary"
      className="mx-4 pt-6 pb-2 md:mx-14 md:pt-8 md:pb-3"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#263040] bg-[#161B22]/90 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.14em] text-[#38BDF8] uppercase">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${statusDotClass} animate-pulse motion-reduce:animate-none`}
          />
          <span>Personal Garage Caretaker</span>
        </div>

        <h1 className="mt-3 mb-2 font-heading text-3xl font-extrabold tracking-[-0.03em] leading-[1.1] text-[#F1F5F9] sm:text-4xl lg:text-[42px]">
          Hello, {userName}!
        </h1>

        <p className="max-w-[65ch] font-body text-xs leading-relaxed text-[#94A3B8] sm:text-sm">
          {statusBrief}
        </p>
      </div>
    </section>
  );
}
