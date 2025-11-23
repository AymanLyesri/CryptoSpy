/**
 * Unified Theme Utilities
 *
 * This file provides utility functions and class name helpers for consistent theming
 * across all components in the application.
 */

// Common class name builders for unified styling
export const unifiedStyles = {
  // Card variations
  card: {
    base: "unified-card",
    compact: "unified-card unified-card--compact",
    hover: "unified-card hover:shadow-unified-hover hover:-translate-y-1",
  },

  // Button variations
  button: {
    primary: "unified-button unified-button--primary",
    secondary: "unified-button unified-button--secondary",
    ghost: "unified-button unified-button--ghost",
    icon: "unified-button unified-button--icon",
  },

  // Input variations
  input: {
    base: "unified-input",
    compact: "unified-input unified-input--compact",
  },

  // Dropdown variations
  dropdown: {
    container: "unified-dropdown",
    item: "unified-dropdown-item",
    itemCompact: "unified-dropdown-item unified-dropdown-item--compact",
    itemHighlighted: "unified-dropdown-item unified-dropdown-item--highlighted",
  },

  // Badge variations
  badge: {
    primary: "unified-badge unified-badge--primary",
    success: "unified-badge unified-badge--success",
    error: "unified-badge unified-badge--error",
  },

  // Text utilities
  text: {
    primary: "text-primary",
    secondary: "text-secondary",
    muted: "text-muted",
    trendPositive: "trend-positive",
    trendNegative: "trend-negative",
  },

  // Loading states
  loading: {
    spinner: "loading-spinner",
    pulse: "loading-pulse",
  },

  // Common effects
  effects: {
    glass: "glass-effect",
    shadow: "shadow-unified",
    shadowHover: "shadow-unified-hover",
  },
};

// Color utilities for dynamic styling
export const colors = {
  // Trend/percentage colors
  getTrendColor: (value: number, useDark = false) => {
    if (value > 0)
      return useDark ? "var(--color-success-400)" : "var(--color-success-600)";
    if (value < 0)
      return useDark ? "var(--color-error-400)" : "var(--color-error-600)";
    return useDark ? "var(--text-secondary)" : "var(--text-muted)";
  },

  // Category colors for badges/tags
  getCategoryColor: (category: string) => {
    const categoryMap: Record<string, string> = {
      market: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      technology:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      defi: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      regulation:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      analysis: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      institutional:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      development:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    };

    return (
      categoryMap[category.toLowerCase()] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    );
  },
};

// Formatting utilities
export const formatters = {
  // Price formatting
  price: (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  },

  // Market cap/volume formatting
  currency: (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  },

  // Supply formatting
  supply: (value: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  },

  // Percentage formatting
  percentage: (value: number) => {
    const isPositive = value > 0;
    return {
      formatted: `${isPositive ? "+" : ""}${value.toFixed(2)}%`,
      isPositive,
      className: isPositive
        ? unifiedStyles.text.trendPositive
        : unifiedStyles.text.trendNegative,
    };
  },

  // Time ago formatting
  timeAgo: (dateString: string) => {
    const now = new Date();
    const publishedAt = new Date(dateString);
    const diffMs = now.getTime() - publishedAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return publishedAt.toLocaleDateString();
    }
  },
};

// Component prop builders
export const buildProps = {
  // Build card props with unified styling
  card: (variant: "base" | "compact" | "hover" = "base", className = "") => ({
    className: `${unifiedStyles.card[variant]} ${className}`,
  }),

  // Build button props with unified styling
  button: (
    variant: "primary" | "secondary" | "ghost" | "icon" = "primary",
    className = ""
  ) => ({
    className: `${unifiedStyles.button[variant]} ${className}`,
  }),

  // Build input props with unified styling
  input: (variant: "base" | "compact" = "base", className = "") => ({
    className: `${unifiedStyles.input[variant]} ${className}`,
  }),

  // Build dropdown item props
  dropdownItem: (isHighlighted = false, isCompact = false, className = "") => {
    let baseClass = isCompact
      ? unifiedStyles.dropdown.itemCompact
      : unifiedStyles.dropdown.item;
    if (isHighlighted) {
      baseClass = `${baseClass} unified-dropdown-item--highlighted`;
    }
    return {
      className: `${baseClass} ${className}`,
    };
  },
};

// CSS variable helpers for dynamic styling
export const cssVars = {
  // Get CSS variable value
  get: (variable: string) => `var(${variable})`,

  // Create inline style object with CSS variables
  style: (properties: Record<string, string>) => {
    const style: Record<string, string> = {};
    Object.entries(properties).forEach(([key, value]) => {
      style[key] = value.startsWith("--") ? `var(${value})` : value;
    });
    return style;
  },

  // Common style patterns
  patterns: {
    card: {
      padding: "var(--spacing-card)",
      borderRadius: "var(--radius-card)",
      boxShadow: "var(--shadow-card)",
    },
    cardCompact: {
      padding: "var(--spacing-base)",
      borderRadius: "var(--radius-base)",
      boxShadow: "var(--shadow-card)",
    },
    input: {
      padding: "var(--spacing-card)",
      borderRadius: "var(--radius-card)",
      boxShadow: "var(--shadow-card)",
    },
    inputCompact: {
      padding: "var(--spacing-sm) var(--spacing-base)",
      borderRadius: "var(--radius-base)",
      boxShadow: "var(--shadow-card)",
    },
  },
};

export default {
  unifiedStyles,
  colors,
  formatters,
  buildProps,
  cssVars,
};
