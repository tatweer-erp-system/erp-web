import type { Config } from "tailwindcss";

/**
 * Tailwind CSS 4 configuration for Tatweer ERP Web.
 *
 * Loaded via `@config "../tailwind.config.ts"` in client/src/index.css.
 * Color tokens reference CSS variables so they stay in sync with
 * Ant Design's ConfigProvider token system and the light/dark theme
 * definitions in index.css's :root / .dark blocks.
 */
export default {
  content: ["./client/src/**/*.{ts,tsx}"],

  darkMode: "class",

  theme: {
    screens: {
      xs: "360px",
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      "2xl": "1600px",
    },

    borderRadius: {
      none: "0px",
      sm: "2px",
      DEFAULT: "4px",
      md: "6px",
      lg: "8px",
      xl: "12px",
      "2xl": "16px",
      full: "9999px",
    },

    fontFamily: {
      sans: ["Poppins", "sans-serif"],
      display: ["Poppins", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },

    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.8125rem", { lineHeight: "1.25rem" }],
      base: ["0.875rem", { lineHeight: "1.5rem" }],
      lg: ["1rem", { lineHeight: "1.5rem" }],
      xl: ["1.125rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.25rem", { lineHeight: "1.75rem" }],
      "3xl": ["1.5rem", { lineHeight: "2rem" }],
      "4xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "5xl": ["2.25rem", { lineHeight: "2.5rem" }],
    },

    extend: {
      colors: {
        /* ── Semantic palette (CSS-variable-backed) ──────────────── */
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        success: {
          DEFAULT: "var(--success, #22c55e)",
          foreground: "var(--success-foreground, #ffffff)",
        },
        warning: {
          DEFAULT: "var(--warning, #f59e0b)",
          foreground: "var(--warning-foreground, #ffffff)",
        },
        error: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        neutral: {
          50: "var(--neutral-50, #f8fafc)",
          100: "var(--neutral-100, #f1f5f9)",
          200: "var(--neutral-200, #e2e8f0)",
          300: "var(--neutral-300, #cbd5e1)",
          400: "var(--neutral-400, #94a3b8)",
          500: "var(--neutral-500, #64748b)",
          600: "var(--neutral-600, #475569)",
          700: "var(--neutral-700, #334155)",
          800: "var(--neutral-800, #1e293b)",
          900: "var(--neutral-900, #0f172a)",
          950: "var(--neutral-950, #020617)",
        },

        /* ── Surface tokens (existing CSS vars) ─────────────────── */
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        /* ── Chart palette ──────────────────────────────────────── */
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },

        /* ── Sidebar ────────────────────────────────────────────── */
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },

      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
        sidebar: "var(--sidebar-width, 260px)",
        "sidebar-collapsed": "var(--sidebar-collapsed-width, 72px)",
        header: "var(--header-height, 64px)",
      },

      zIndex: {
        dropdown: "1050",
        sticky: "1020",
        fixed: "1030",
        "modal-backdrop": "1040",
        modal: "1050",
        popover: "1060",
        tooltip: "1070",
        toast: "1080",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },

  plugins: [],
} satisfies Config;
