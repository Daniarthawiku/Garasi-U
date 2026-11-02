"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/shared/atoms/Icon";

const SLUG_MAP = {
  "aston martin": "aston-martin",
  audi: "audi",
  bentley: "bentley",
  bmw: "bmw",
  bugatti: "bugatti",
  ferrari: "ferrari",
  honda: "honda",
  jaguar: "jaguar",
  lamborghini: "lamborghini",
  maserati: "maserati",
  mclaren: "mclaren",
  mercedes: "mercedes-benz",
  "mercedes-benz": "mercedes-benz",
  porsche: "porsche",
  toyota: "toyota",
  lexus: "lexus",
  "rolls royce": "rolls-royce",
  "rolls-royce": "rolls-royce",
};

const GITHUB_LOGO_CDN =
  "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";

export default function SupportedBrands() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const API_URL =
    "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/data.json";

  const fetchBrands = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Gagal mengambil data dari server API.");
      }

      const data = await response.json();

      const premiumBrands = [
        "Aston Martin",
        "Audi",
        "Bentley",
        "BMW",
        "Bugatti",
        "Ferrari",
        "Honda",
        "Jaguar",
        "Lamborghini",
        "Maserati",
        "McLaren",
        "Mercedes-Benz",
        "Mercedes",
        "Porsche",
        "Toyota",
        "Lexus",
        "Rolls-Royce",
        "Rolls Royce",
      ];

      const filteredData = data
        .filter((car) => premiumBrands.includes(car.name))
        .map((car) => {
          const normalizedKey = car.name.toLowerCase().trim();
          const slug =
            car.slug ||
            SLUG_MAP[normalizedKey] ||
            normalizedKey.replace(/\s+/g, "-");

          return {
            ...car,
            logo:
              car.image?.optimized ||
              car.image?.thumb ||
              `${GITHUB_LOGO_CDN}/${slug}.png`,
          };
        });

      setBrands(filteredData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <footer
      aria-label="Supported automotive manufacturers"
      className="relative w-full overflow-hidden border-t border-line-subtle/50 bg-canvas/80 py-6 backdrop-blur-md"
    >
      {/* Hairline highlight on top border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-action/25 to-transparent"
      />

      {/* Skeleton load */}
      {isLoading && (
        <div className="mx-auto flex max-w-7xl items-center justify-around gap-12 px-8 py-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-9 w-16 animate-pulse rounded bg-surface-raised/70"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="mx-auto flex max-w-md items-center justify-center gap-4 px-6 py-1.5 text-xs">
          <span className="flex items-center gap-1.5 font-mono text-status-danger">
            <Icon name="error" size={15} />
            Gagal memuat telemetri brand pabrikan
          </span>
          <button
            type="button"
            onClick={fetchBrands}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-line-subtle bg-surface-raised px-3 py-1 font-mono text-[11px] text-ink-primary transition-colors hover:border-action active:scale-[0.98]"
          >
            <Icon name="refresh" size={14} className="text-action" />
            Muat Ulang
          </button>
        </div>
      )}

      {/* Success State */}
      {!isLoading && !isError && brands.length > 0 && (
        <div className="group relative flex w-full items-center overflow-hidden py-1">
          {/* Fade masks kiri & kanan */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas via-canvas/85 to-transparent md:w-48"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas via-canvas/85 to-transparent md:w-48"
          />

          <div className="flex items-center animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
            {brands.map((brand, index) => (
              <BrandLogo key={`brand-1-${index}`} brand={brand} />
            ))}
            {brands.map((brand, index) => (
              <BrandLogo key={`brand-2-${index}`} brand={brand} />
            ))}
          </div>
        </div>
      )}
    </footer>
  );
}

function BrandLogo({ brand }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) return null;

  return (
    <div
      title={brand.name}
      className="group/logo relative mx-8 flex shrink-0 items-center justify-center md:mx-12"
    >
      {/* Spotlight saat hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-full bg-action/0 blur-xl transition-all duration-500 group-hover/logo:bg-action/15"
      />
      <img
        src={brand.logo}
        alt={brand.name}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setImgFailed(true)}
        className="relative h-12 w-auto max-w-[110px] object-contain transition-all duration-500 ease-out"
      />
    </div>
  );
}
