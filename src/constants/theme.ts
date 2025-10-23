// src/constants/theme.ts
/**
 * Theme Constants
 * Centralized theme configuration for consistent UI across the app
 */

export const THEME = {
  // Background Gradients
  BACKGROUNDS: {
    // Main app background - soft gradient
    MAIN: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",

    // Alternative backgrounds for variety
    WARM: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50",
    COOL: "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50",
    NEUTRAL: "bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50",

    // Card backgrounds
    CARD: "bg-white",
    CARD_HOVER: "bg-gradient-to-br from-white to-gray-50",

    // Section backgrounds
    SECTION_LIGHT: "bg-gradient-to-br from-white to-gray-50",
    SECTION_SUBTLE: "bg-gradient-to-br from-blue-50/50 to-indigo-50/50",
  },

  // Color Gradients for buttons, badges, etc.
  GRADIENTS: {
    PRIMARY: "bg-gradient-to-r from-blue-600 to-indigo-600",
    SUCCESS: "bg-gradient-to-r from-green-600 to-emerald-600",
    WARNING: "bg-gradient-to-r from-orange-600 to-amber-600",
    DANGER: "bg-gradient-to-r from-red-600 to-rose-600",
    INFO: "bg-gradient-to-r from-cyan-600 to-blue-600",
    PURPLE: "bg-gradient-to-r from-purple-600 to-pink-600",
  },

  // Text Gradients
  TEXT_GRADIENTS: {
    PRIMARY:
      "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",
    SUCCESS:
      "bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent",
    WARNING:
      "bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent",
    DANGER:
      "bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent",
  },

  // Shadow styles
  SHADOWS: {
    SOFT: "shadow-soft",
    MEDIUM: "shadow-md hover:shadow-lg transition-shadow duration-200",
    LARGE: "shadow-lg hover:shadow-xl transition-shadow duration-200",
    COLORED: {
      BLUE: "shadow-lg shadow-blue-200/50",
      GREEN: "shadow-lg shadow-green-200/50",
      RED: "shadow-lg shadow-red-200/50",
      PURPLE: "shadow-lg shadow-purple-200/50",
    },
  },

  // Border styles
  BORDERS: {
    LIGHT: "border border-gray-200",
    MEDIUM: "border-2 border-gray-300",
    COLORED: {
      BLUE: "border-2 border-blue-200",
      GREEN: "border-2 border-green-200",
      ORANGE: "border-2 border-orange-200",
      RED: "border-2 border-red-200",
      PURPLE: "border-2 border-purple-200",
    },
  },

  // Glass morphism effect
  GLASS: {
    LIGHT: "bg-white/70 backdrop-blur-md",
    MEDIUM: "bg-white/50 backdrop-blur-lg",
    DARK: "bg-gray-900/70 backdrop-blur-md",
  },

  // Animation classes
  ANIMATIONS: {
    FADE_IN: "animate-fade-in",
    SLIDE_UP: "animate-slide-up",
    SCALE: "hover:scale-105 transition-transform duration-200",
    GLOW: "hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300",
  },
} as const;

// Helper function to combine theme classes
export const getCardClasses = (
  variant: "default" | "hover" | "glass" = "default",
) => {
  const baseClasses = "rounded-2xl";

  switch (variant) {
    case "hover":
      return `${baseClasses} ${THEME.BACKGROUNDS.CARD_HOVER} ${THEME.SHADOWS.MEDIUM} ${THEME.BORDERS.LIGHT}`;
    case "glass":
      return `${baseClasses} ${THEME.GLASS.LIGHT} ${THEME.SHADOWS.SOFT} ${THEME.BORDERS.LIGHT}`;
    default:
      return `${baseClasses} ${THEME.BACKGROUNDS.CARD} ${THEME.SHADOWS.MEDIUM} ${THEME.BORDERS.LIGHT}`;
  }
};

// Helper for gradient buttons
export const getButtonGradient = (
  variant: "primary" | "success" | "warning" | "danger" | "info" = "primary",
) => {
  const gradients = {
    primary: THEME.GRADIENTS.PRIMARY,
    success: THEME.GRADIENTS.SUCCESS,
    warning: THEME.GRADIENTS.WARNING,
    danger: THEME.GRADIENTS.DANGER,
    info: THEME.GRADIENTS.INFO,
  };

  return `${gradients[variant]} text-white hover:opacity-90 transition-opacity duration-200`;
};
