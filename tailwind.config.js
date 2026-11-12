/**
 * GarasiU design tokens — dikonversi dari :root variables di:
 * - GarasiiU/style.css   (Auth: Login & Sign Up)
 * - GarasiiU/styleB.css  (Fuel Log)
 * - GarasiiU/styleD.css  (Dashboard)
 * - GarasiiU/serviceLog.html (Service Log)
 *
 * Warna yang duplikat diabaikan/digabungkan ke satu token kanonik.
 * Proyek ini memakai Tailwind v4, sehingga file ini dimuat lewat directive
 * `@config "../../tailwind.config.js";` di src/app/globals.css.
 *
 * Pemetaan variabel lama -> token Tailwind:
 *   --canvas-void          -> canvas            (bg-canvas, text-canvas)
 *   --surface-base         -> surface-base      (bg-surface-base)
 *   --surface-raised       -> surface-raised    (bg-surface-raised)
 *   --surface-overlay      -> surface-overlay   (bg-surface-overlay)
 *   --surface-bright       -> surface-bright    (bg-surface-bright)
 *   --text-primary         -> ink-primary       (text-ink-primary)
 *   --text-secondary       -> ink-secondary     (text-ink-secondary)
 *   --text-muted           -> ink-muted         (text-ink-muted)
 *   --action-primary       -> action            (text-action, bg-action)
 *   --action-primary-hover -> action-hover      (hover:bg-action-hover)
 *   .dot-accent (#2563EB)  -> action-accent     (bg-action-accent)
 *   --status-danger        -> status-danger     (text-status-danger, bg-status-danger)
 *   --status-success       -> status-success    (text-status-success, bg-status-success)
 *   --status-warning       -> status-warning    (text-status-warning, bg-status-warning)
 *   --border-subtle        -> line-subtle       (border-line-subtle)
 *   --border-bright        -> line-bright       (border-line-bright)
 *   --font-heading         -> font-heading
 *   --font-body            -> font-body
 *   --font-mono            -> font-mono
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0A0D12",
        surface: {
          base: "#0D1117",
          raised: "#161B22",
          overlay: "#1F2633",
          bright: "#353940",
        },
        ink: {
          primary: "#F1F5F9",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        action: {
          DEFAULT: "#38BDF8",
          hover: "#60CDFC",
          accent: "#2563EB",
        },
        status: {
          danger: "#EF4444",
          success: "#10B981",
          warning: "#F59E0B",
        },
        line: {
          subtle: "#263040",
          bright: "#3B475C",
        },
      },
      fontFamily: {
        heading: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-inter)", "-apple-system", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(to right, rgba(38, 48, 64, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(38, 48, 64, 0.25) 1px, transparent 1px)",
      },
      boxShadow: {
        "glow-danger": "0 0 18px #EF4444",
        "glow-warning": "0 0 18px #F59E0B",
        "glow-action": "0 4px 14px rgba(56, 189, 248, 0.15)",
        "card-auth": "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      },
      letterSpacing: {
        heading: "-0.02em",
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [],
};
