import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Design system color utilities
    'text-primary-500', 'text-primary-600', 'text-primary-700',
    'text-accent-1', 'text-success', 'text-danger', 'text-warning',
    'text-muted-50', 'text-muted-100', 'text-muted-200', 'text-muted-300',
    'text-muted-400', 'text-muted-500', 'text-muted-600', 'text-muted-700',
    'text-muted-800', 'text-muted-900', 'text-bg', 'text-surface',
    'bg-primary-50', 'bg-primary-100', 'bg-primary-200', 'bg-primary-500',
    'bg-primary-600', 'bg-primary-700', 'bg-primary-900',
    'bg-accent-1', 'bg-success', 'bg-danger', 'bg-warning',
    'bg-muted-50', 'bg-muted-100', 'bg-muted-200', 'bg-muted-300',
    'bg-muted-900', 'bg-bg', 'bg-surface',
    'border-primary-100', 'border-primary-200', 'border-primary-500',
    'border-accent-1', 'border-success', 'border-danger',
    'border-muted-100', 'border-muted-200', 'border-muted-300',
    'hover:bg-primary-50', 'hover:bg-primary-200', 'hover:text-primary-500',
    'hover:text-danger', 'hover:border-primary-200', 'hover:border-primary-400',
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors
        'color-primary': {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        'color-accent': {
          1: 'var(--color-accent-1)',
        },
        'color-success': 'var(--color-success)',
        'color-danger': 'var(--color-danger)',
        'color-warning': 'var(--color-warning)',
        'color-muted': {
          50: 'var(--color-muted-50)',
          100: 'var(--color-muted-100)',
          200: 'var(--color-muted-200)',
          300: 'var(--color-muted-300)',
          400: 'var(--color-muted-400)',
          500: 'var(--color-muted-500)',
          600: 'var(--color-muted-600)',
          700: 'var(--color-muted-700)',
          800: 'var(--color-muted-800)',
          900: 'var(--color-muted-900)',
        },
        'color-bg': 'var(--color-bg)',
        'color-surface': 'var(--color-surface)',
        'color-overlay': 'var(--color-overlay)',
        'color-profit': 'var(--color-profit)',
        'color-loss': 'var(--color-loss)',
        'color-chart': {
          primary: 'var(--color-chart-primary)',
          secondary: 'var(--color-chart-secondary)',
          tertiary: 'var(--color-chart-tertiary)',
          grid: 'var(--color-chart-grid)',
          'pnl-up': 'var(--color-chart-pnl-up)',
          'pnl-down': 'var(--color-chart-pnl-down)',
        },
        // Direct color access for Tailwind classes (text-primary-500, bg-muted-600, etc.)
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        accent: {
          DEFAULT: 'var(--color-accent-1)',
          1: 'var(--color-accent-1)',
        },
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        muted: {
          50: 'var(--color-muted-50)',
          100: 'var(--color-muted-100)',
          200: 'var(--color-muted-200)',
          300: 'var(--color-muted-300)',
          400: 'var(--color-muted-400)',
          500: 'var(--color-muted-500)',
          600: 'var(--color-muted-600)',
          700: 'var(--color-muted-700)',
          800: 'var(--color-muted-800)',
          900: 'var(--color-muted-900)',
        },
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        overlay: 'var(--color-overlay)',
        profit: 'var(--color-profit)',
        loss: 'var(--color-loss)',
        // Shadcn compatibility
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // Note: 'primary' is overridden above for design system colors
        // Shadcn primary (kept for compatibility but design system takes precedence)
        'shadcn-primary': {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // Note: 'muted' is overridden above for design system colors
        // Shadcn muted (kept for compatibility but design system takes precedence)
        'shadcn-muted': {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        // Note: 'accent' is overridden above for design system colors
        // Shadcn accent (kept for compatibility but design system takes precedence)
        'shadcn-accent': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
