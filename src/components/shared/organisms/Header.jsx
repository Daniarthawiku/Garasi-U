"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/shared/atoms/Icon";
import { authApi } from "@/lib/api";

/**
 * [Atomic Design: ORGANISM — Shared]
 * Header — Navigasi utama aplikasi GarasiU (Dashboard, Fuel Log, Service Log, + Add New Vehicle, Logout).
 */
export default function Header({
  title = "Welcome to GarasiU",
  navLinks = [],
  activeHref = "/",
  ctaLabel = "+ Add New Vehicle",
  onCtaClick,
  profile = { src: "/img/profile.png", alt: "user profile picture" },
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
    } finally {
      window.location.assign("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex flex-col items-center gap-4 border-b border-line-subtle bg-surface-base/90 px-4 py-4 text-center backdrop-blur md:flex-row md:justify-between md:px-14 md:py-3 md:text-left print:hidden">
      <h2 className="text-2xl">{title}</h2>

      <nav className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:gap-0">
        {navLinks.map((link) => {
          const isActive = link.href === activeHref;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`px-4 py-2 text-base underline-offset-4 transition-all duration-400 hover:text-action hover:underline ${
                isActive ? "text-action" : "text-ink-secondary"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex w-full items-center justify-center gap-3 md:w-auto">
        <button
          type="button"
          id="btn-add-vehicle"
          onClick={onCtaClick}
          className="cursor-pointer rounded bg-action px-3 py-2 font-heading font-semibold text-canvas transition hover:brightness-110 active:scale-95"
        >
          {ctaLabel}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign out from GarasiU"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-line-subtle bg-surface-overlay px-3 py-2 font-mono text-xs font-semibold text-ink-secondary transition hover:border-status-danger/40 hover:text-status-danger disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="logout" size={16} />
          <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
        </button>
        <Image
          src={profile.src}
          alt={profile.alt}
          width={44}
          height={44}
          className="rounded-[10%] ring-1 ring-line-subtle"
        />
      </div>
    </header>
  );
}
