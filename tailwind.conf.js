module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Extend with our unified design tokens
      spacing: {
        'card': 'var(--spacing-card)',
        'section': 'var(--spacing-lg)',
      },
      borderRadius: {
        'card': 'var(--radius-card)',
        'button': 'var(--radius-base)',
        'input': 'var(--radius-card)',
      },
      boxShadow: {
        'unified': 'var(--shadow-card)',
        'unified-hover': 'var(--shadow-card-hover)',
        'unified-lg': 'var(--shadow-lg)',
      },
      colors: {
        // Use CSS custom properties for colors that support light/dark mode
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '300ms',
        'slow': '500ms',
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
      },
    },
  },
  plugins: [
    // Plugin to add our utility classes
    function({ addUtilities }) {
      addUtilities({
        '.glass-effect': {
          'backdrop-filter': 'blur(12px)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
        },
        '.trend-positive': {
          color: 'var(--color-success-600)',
          'font-weight': '600',
        },
        '.trend-negative': {
          color: 'var(--color-error-600)',
          'font-weight': '600',
        },
      });
    },
  ],
};
