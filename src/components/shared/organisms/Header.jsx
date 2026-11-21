"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navLinks as defaultNavLinks } from "@/data/garageData";
import { authApi } from "@/lib/api";

function NavRouteIcon({ href }) {
  if (href === "/fuel-log") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
      >
        <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14" />
        <path d="M3 20h13" />
        <path d="M7 8h5" />
        <path d="M15 9h2a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2v0a1 1 0 0 0 1-1V9.5L19.5 7" />
      </svg>
    );
  }

  if (href === "/service-log") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
      >
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-5.6 5.6a1.5 1.5 0 0 0 2.1 2.1l5.6-5.6a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.1-2.1 2.3-2.3Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path d="M12 13l4-4" />
      <path d="M3.34 17a9.5 9.5 0 1 1 17.32 0" />
      <path d="M6.5 20h11" />
    </svg>
  );
}

function VehicleActionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M19 16h1.5a1.5 1.5 0 0 0 1.5-1.5v-2.2a2 2 0 0 0-1.3-1.9L18 9.4l-2.2-2.7A2 2 0 0 0 14.2 6H7.8a2 2 0 0 0-1.7 1L4.2 10.2A3 3 0 0 0 3 12.6v1.9A1.5 1.5 0 0 0 4.5 16H6" />
      <circle cx="8" cy="16.5" r="1.75" />
      <circle cx="16.5" cy="16.5" r="1.75" />
      <path d="M9.75 16.5h5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function MenuToggleIcon({ isOpen }) {
  if (isOpen) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="14" y2="17" />
    </svg>
  );
}

/**
 * [Atomic Design: ORGANISM - Shared]
 * Header - Rivian Web Cockpit navigation bar with dynamic usePathname() active pill state,
 * primary/secondary CTA hierarchy, and a compact 64px mobile bar with slide-down drawer.
 */
export default function Header({
  navLinks = defaultNavLinks,
  activeHref,
  ctaLabel = "Add Vehicle",
  mobileCtaLabel = "+ Vehicle",
  onCtaClick,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openPathname, setOpenPathname] = useState(null);

  const currentPath = pathname || activeHref || "/";
  const isMobileMenuOpen = openPathname === currentPath;

  const isRouteActive = (href) => {
    if (href === "/") {
      return currentPath === "/";
    }
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenPathname(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setOpenPathname(null);
      await authApi.logout();
    } finally {
      router.push("/auth");
      router.refresh();
    }
  };

  const handleToggleMenu = () => {
    setOpenPathname((prev) => (prev === currentPath ? null : currentPath));
  };

  const handleMobileAddVehicle = () => {
    setOpenPathname(null);
    if (onCtaClick) onCtaClick();
  };

  return (
    <header className="telemetry-glass sticky top-0 z-30 h-20 border-b border-[#263040] bg-[#0D1117]/85 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between gap-3 px-4 md:px-14">
        {/* Left: Geometric Automotive Brand Mark + Monospace Telemetry Badge */}
        <div className="flex items-center gap-2">
          <Image
            src="/img/garasiu-wordmark.png"
            alt="GARASIU"
            width={1024}
            height={585}
            priority
            className="h-16 w-auto object-contain transition-opacity duration-200 group-hover:opacity-85 sm:h-8"
          />
        </div>

        {/* Center: Segmented Pill Container for Desktop Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 rounded-full border border-[#263040] bg-[#0A0D12] p-1 md:flex"
        >
          {navLinks.map((link) => {
            const isActive = isRouteActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-body text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] motion-reduce:transition-none ${isActive
                  ? "border-[#263040] bg-[#161B22] text-[#F1F5F9] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  : "border-transparent text-[#94A3B8] hover:bg-[#161B22]/50 hover:text-[#F1F5F9]"
                  }`}
              >
                <NavRouteIcon href={link.href} />
                <span>{link.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.7)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Desktop Primary / Secondary CTA Hierarchy */}
        <div className="hidden shrink-0 items-center gap-2.5 md:flex">
          <button
            type="button"
            id="btn-add-vehicle"
            onClick={onCtaClick}
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#38BDF8] px-3.5 py-2 font-heading text-xs font-bold text-[#0A0D12] shadow-[0_2px_12px_rgba(56,189,248,0.2)] transition-all duration-200 hover:bg-[#60CDFC] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1117] motion-reduce:transition-none"
          >
            <VehicleActionIcon />
            <span>{ctaLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign out from GarasiU"
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#263040] bg-transparent px-3 py-2 font-mono text-xs font-medium text-[#94A3B8] transition-all duration-200 hover:border-[#EF4444]/50 hover:bg-[#EF4444]/10 hover:text-[#EF4444] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1117] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          >
            <LogoutIcon />
            <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
          </button>
        </div>

        {/* Right (Mobile): Compact "+ Vehicle" Quick CTA + Hamburger Toggle */}
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <button
            type="button"
            id="btn-add-vehicle-mobile"
            onClick={handleMobileAddVehicle}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#38BDF8] px-2.5 py-1.5 font-heading text-xs font-bold text-[#0A0D12] shadow-[0_2px_10px_rgba(56,189,248,0.2)] transition-all duration-200 hover:bg-[#60CDFC] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1117] motion-reduce:transition-none"
          >
            <VehicleActionIcon />
            <span>{mobileCtaLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleMenu}
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#263040] bg-[#161B22]/90 text-[#F1F5F9] transition-colors hover:border-[#38BDF8]/50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1117] motion-reduce:transition-none"
          >
            <MenuToggleIcon isOpen={isMobileMenuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Navigation Drawer */}
      <div
        id="mobile-navigation-drawer"
        data-mobile-drawer
        aria-hidden={!isMobileMenuOpen}
        className={`telemetry-glass absolute inset-x-0 top-full origin-top border-b border-[#263040] bg-[#0D1117]/95 px-4 py-4 backdrop-blur-md transition-all duration-200 ease-out motion-reduce:transition-none md:hidden ${isMobileMenuOpen
          ? "pointer-events-auto translate-y-0 opacity-100 shadow-2xl"
          : "pointer-events-none invisible -translate-y-2 opacity-0"
          }`}
      >
        <div className="mb-2.5 flex items-center justify-between px-1">
          <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#64748B] uppercase">
            Telemetry Routes
          </span>
          <span className="font-mono text-[10px] text-[#38BDF8]">
            {currentPath}
          </span>
        </div>

        <nav
          aria-label="Mobile navigation"
          className="flex flex-col gap-1.5 rounded-xl border border-[#263040] bg-[#0A0D12] p-1.5"
        >
          {navLinks.map((link) => {
            const isActive = isRouteActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                tabIndex={isMobileMenuOpen ? 0 : -1}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpenPathname(null)}
                className={`flex min-h-[44px] items-center justify-between rounded-lg border px-3.5 py-2.5 font-body text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${isActive
                  ? "border-[#263040] bg-[#161B22] text-[#F1F5F9]"
                  : "border-transparent text-[#94A3B8] hover:bg-[#161B22]/60 hover:text-[#F1F5F9]"
                  }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <NavRouteIcon href={link.href} />
                  <span>{link.label}</span>
                </span>
                {isActive && (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-[#38BDF8] uppercase">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.7)]"
                    />
                    Active
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-3 border-t border-[#263040] pt-3">
          <button
            type="button"
            tabIndex={isMobileMenuOpen ? 0 : -1}
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#263040] bg-transparent px-3.5 py-2.5 font-mono text-xs font-semibold text-[#94A3B8] transition-colors hover:border-[#EF4444]/50 hover:bg-[#EF4444]/10 hover:text-[#EF4444] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogoutIcon />
            <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
