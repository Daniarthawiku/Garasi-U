export default function DashboardHero({
  userName = "User",
  description,
}) {
  return (
    <section className="mx-4 my-6 border-b border-line-subtle pb-6 md:mx-14 md:my-8">
      <h1 className="mt-2 mb-1 text-[32px]">Halo, {userName}!</h1>
      {description && (
        <p className="max-w-2xl text-xs text-ink-secondary">{description}</p>
      )}
    </section>
  );
}
