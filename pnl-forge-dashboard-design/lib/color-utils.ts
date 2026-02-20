/**
 * Color utility functions for consistent color usage
 * Maps design system CSS variables to Tailwind classes
 */

export const colors = {
  primary: {
    50: 'color-primary-50',
    100: 'color-primary-100',
    200: 'color-primary-200',
    300: 'color-primary-300',
    400: 'color-primary-400',
    500: 'color-primary-500',
    600: 'color-primary-600',
    700: 'color-primary-700',
    800: 'color-primary-800',
    900: 'color-primary-900',
  },
  accent: {
    1: 'color-accent-1',
  },
  success: 'color-success',
  danger: 'color-danger',
  warning: 'color-warning',
  muted: {
    50: 'color-muted-50',
    100: 'color-muted-100',
    200: 'color-muted-200',
    300: 'color-muted-300',
    400: 'color-muted-400',
    500: 'color-muted-500',
    600: 'color-muted-600',
    700: 'color-muted-700',
    800: 'color-muted-800',
    900: 'color-muted-900',
  },
  bg: 'color-bg',
  surface: 'color-surface',
  profit: 'color-profit',
  loss: 'color-loss',
}

/**
 * Helper to convert CSS variable references to Tailwind classes
 * Usage: textColor(colors.muted.600) => 'text-color-muted-600'
 */
export function textColor(color: string) {
  return `text-${color}`
}

export function bgColor(color: string) {
  return `bg-${color}`
}

export function borderColor(color: string) {
  return `border-${color}`
}
