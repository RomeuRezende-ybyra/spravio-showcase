import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Dashboard OKLCH color system (dark theme via CSS vars)
        bg: 'var(--bg)',
        'bg-el': 'var(--bg-el)',
        'bg-el-2': 'var(--bg-el-2)',
        'bg-el-3': 'var(--bg-el-3)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        rule: 'var(--rule)',
        'rule-2': 'var(--rule-2)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-deep': 'var(--accent-deep)',
        good: 'var(--good)',
        warn: 'var(--warn)',
        bad: 'var(--bad)',

        // Legacy teal scale (preserve for existing components)
        teal: {
          50: '#effefa',
          100: '#c8fff4',
          200: '#91fee9',
          300: '#52f5db',
          400: '#1edec8',
          500: '#00C9B1',
          600: '#0097A7',
          700: '#006B77',
          800: '#085560',
          900: '#0c464f',
          950: '#002b34',
        },

        // Auth design system (warm editorial - preserved)
        cream: 'oklch(0.975 0.012 75)',
        'cream-2': 'oklch(0.955 0.018 72)',
        'cream-3': 'oklch(0.93 0.022 70)',
        paper: 'oklch(0.99 0.008 80)',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size)',
      },
      spacing: {
        'row': 'var(--row-h)',
      },
      borderRadius: {
        'sv': '6px',
        'sv-sm': '4px',
        'sv-xs': '2px',
      },
      boxShadow: {
        'sv': 'var(--shadow)',
        'sv-sm': 'var(--shadow-sm)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
