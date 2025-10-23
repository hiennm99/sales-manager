/**
 * Centralized Theme System
 * Single source of truth for colors, shadows, spacing, and typography
 * Used across all components for consistency
 */

export const theme = {
  // Color Palette
  colors: {
    // Primary - Blue
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    // Secondary - Gray
    secondary: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
    // Success - Green
    success: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#145231",
    },
    // Warning - Amber
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    // Danger - Red
    danger: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    // Info - Cyan
    info: {
      50: "#ecf0ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
    },
  },

  // Shadows
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  },

  // Border Radius
  radius: {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },

  // Spacing
  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },

  // Typography
  typography: {
    // Font sizes
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
    // Font weights
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    // Line heights
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // Transitions
  transitions: {
    none: "none",
    fast: "all 150ms ease-in-out",
    base: "all 200ms ease-in-out",
    slow: "all 300ms ease-in-out",
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: "auto",
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },

  // Gradient presets (used across 30+ files)
  gradients: {
    // Primary gradients
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600",
    primaryHover: "hover:from-blue-700 hover:to-indigo-700",
    secondary: "bg-gradient-to-r from-gray-600 to-slate-600",
    success: "bg-gradient-to-r from-green-600 to-emerald-600",
    successHover: "hover:from-green-700 hover:to-emerald-700",
    danger: "bg-gradient-to-r from-red-600 to-rose-600",
    dangerHover: "hover:from-red-700 hover:to-rose-700",
    warning: "bg-gradient-to-r from-amber-600 to-orange-600",
    warningHover: "hover:from-amber-700 hover:to-orange-700",
    info: "bg-gradient-to-r from-sky-600 to-blue-600",
    infoHover: "hover:from-sky-700 hover:to-blue-700",
    purple: "bg-gradient-to-r from-purple-600 to-pink-600",
    purpleHover: "hover:from-purple-700 hover:to-pink-700",

    // Soft gradients for backgrounds
    softPrimary: "bg-gradient-to-r from-blue-50 to-indigo-50",
    softSuccess: "bg-gradient-to-r from-green-50 to-emerald-50",
    softDanger: "bg-gradient-to-r from-red-50 to-rose-50",
    softWarning: "bg-gradient-to-r from-amber-50 to-orange-50",
    softInfo: "bg-gradient-to-r from-sky-50 to-blue-50",
    softPurple: "bg-gradient-to-r from-purple-50 to-pink-50",

    // Soft colored overlays for cards (StatCard variants)
    overlayBlue: "from-blue-500/10 via-blue-400/5 to-transparent",
    overlayPurple: "from-purple-500/10 via-purple-400/5 to-transparent",
    overlayGreen: "from-green-500/10 via-green-400/5 to-transparent",
    overlayOrange: "from-orange-500/10 via-orange-400/5 to-transparent",
    overlayPink: "from-pink-500/10 via-pink-400/5 to-transparent",
    overlayCyan: "from-cyan-500/10 via-cyan-400/5 to-transparent",

    // Icon backgrounds
    iconBlue: "bg-gradient-to-br from-blue-100 to-blue-50",
    iconPurple: "bg-gradient-to-br from-purple-100 to-purple-50",
    iconGreen: "bg-gradient-to-br from-green-100 to-emerald-50",
    iconOrange: "bg-gradient-to-br from-orange-100 to-amber-50",
    iconPink: "bg-gradient-to-br from-pink-100 to-rose-50",
    iconCyan: "bg-gradient-to-br from-cyan-100 to-sky-50",

    // Accent lines
    accentBlue: "from-blue-500 via-blue-400 to-cyan-400",
    accentPurple: "from-purple-500 via-fuchsia-400 to-pink-400",
    accentGreen: "from-green-500 via-emerald-400 to-teal-400",
    accentOrange: "from-orange-500 via-amber-400 to-yellow-400",
    accentPink: "from-pink-500 via-rose-400 to-fuchsia-400",
    accentCyan: "from-cyan-500 via-sky-400 to-blue-400",
  },

  // Semantic text colors
  text: {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    muted: "text-gray-500",
    disabled: "text-gray-400",
    error: "text-red-600",
    success: "text-green-600",
    warning: "text-amber-600",
    info: "text-blue-600",
    link: "text-blue-600 hover:text-blue-700",
  },

  // Component-specific presets
  components: {
    // Button presets
    button: {
      base: "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
      sizes: {
        sm: "px-3 py-1.5 text-sm gap-1.5",
        md: "px-4 py-2 text-base gap-2",
        lg: "px-6 py-3 text-lg gap-2.5",
      },
      variants: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary:
          "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
        outline:
          "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        success:
          "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      },
    },

    // Input presets
    input: {
      base: "w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed",
      border: "border-gray-300",
      error: "border-red-500 focus:ring-red-500",
      success: "border-green-500 focus:ring-green-500",
    },

    // Card presets
    card: {
      base: "bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300",
      compact: "bg-white rounded-lg shadow-md border border-gray-200 p-4",
    },

    // Section presets
    section: {
      base: "bg-white rounded-2xl shadow-xl border border-gray-100 p-6",
      header: "flex items-center justify-between mb-6",
      title: "text-xl font-bold text-gray-900",
    },

    // Badge/Tag presets
    badge: {
      base: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      primary: "bg-blue-100 text-blue-800",
      secondary: "bg-gray-100 text-gray-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-amber-100 text-amber-800",
      danger: "bg-red-100 text-red-800",
      info: "bg-sky-100 text-sky-800",
      purple: "bg-purple-100 text-purple-800",
    },

    // Table presets
    table: {
      container: "overflow-x-auto rounded-xl border border-gray-200",
      base: "min-w-full divide-y divide-gray-200",
      header: "bg-gradient-to-r from-blue-50 to-indigo-50",
      headerCell:
        "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider",
      body: "bg-white divide-y divide-gray-200",
      row: "hover:bg-blue-50 transition-colors duration-200",
      cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
      footer: "bg-gray-50 px-6 py-3 border-t-2 border-gray-200",
    },

    // Modal presets
    modal: {
      overlay:
        "fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 transition-opacity duration-300",
      container: "fixed inset-0 z-50 flex items-center justify-center p-4",
      content:
        "bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300",
      header: "p-6 text-center",
      footer: "px-6 pb-6 flex gap-3",
    },

    // Avatar presets
    avatar: {
      sm: "w-8 h-8 rounded-full",
      md: "w-12 h-12 rounded-full",
      lg: "w-16 h-16 rounded-full",
      xl: "w-20 h-20 rounded-full",
    },

    // Spinner/Loading presets
    spinner: {
      sm: "w-4 h-4 animate-spin",
      md: "w-5 h-5 animate-spin",
      lg: "w-6 h-6 animate-spin",
    },

    // Divider presets
    divider: {
      horizontal: "border-t border-gray-200 my-4",
      vertical: "border-l border-gray-200 mx-4",
    },
  },
} as const;

// Type exports for TypeScript
export type Theme = typeof theme;
export type ColorKey = keyof typeof theme.colors;
export type ShadowKey = keyof typeof theme.shadows;
export type RadiusKey = keyof typeof theme.radius;
