import { useEffect, useRef } from 'react'

/**
 * Theme colors from PageConfig
 */
export interface ThemeColors {
  themeColor1?: string
  themeColor2?: string
  themeColor3?: string
  backgroundColor?: string
}

/**
 * Convert a hex color to HSL values string (without hsl() wrapper)
 * Returns format: "H S% L%" for CSS variable compatibility
 */
function hexToHslValues(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '')

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    // Achromatic
    return `0 0% ${Math.round(l * 100)}%`
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    case b:
      h = ((r - g) / d + 4) / 6
      break
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Check if a value is a gradient string
 */
function isGradient(value: string): boolean {
  return /^(linear|radial)-gradient\(.+\)$/.test(value)
}

/**
 * Apply theme colors to CSS variables on document root
 * This enables site-wide theming using the casino's configured colors
 */
export function applyThemeColors(colors: ThemeColors) {
  const root = document.documentElement

  if (colors.themeColor1) {
    const hsl = hexToHslValues(colors.themeColor1)
    // Primary color mapping
    root.style.setProperty('--primary', hsl)
    root.style.setProperty('--casino-salmon', hsl)
    root.style.setProperty('--tile-hover-border', `var(--primary)`)
  }

  if (colors.themeColor2) {
    const hsl = hexToHslValues(colors.themeColor2)
    // Secondary color mapping
    root.style.setProperty('--secondary', hsl)
    root.style.setProperty('--ring', hsl)
    root.style.setProperty('--casino-blue', hsl)
  }

  if (colors.themeColor3) {
    const hsl = hexToHslValues(colors.themeColor3)
    // Tertiary/accent color mapping
    root.style.setProperty('--accent', hsl)
    root.style.setProperty('--casino-pink', hsl)
  }

  if (colors.backgroundColor) {
    // Store the raw background value (could be gradient or solid color)
    root.style.setProperty('--page-background', colors.backgroundColor)

    // For solid colors, also update the HSL-based variables
    if (!isGradient(colors.backgroundColor)) {
      const hsl = hexToHslValues(colors.backgroundColor)
      root.style.setProperty('--background', hsl)
      root.style.setProperty('--surface-base', hsl)
    }

    // Apply the background to body
    document.body.style.background = colors.backgroundColor
  }
}

/**
 * Clear theme color overrides, restoring CSS defaults
 */
export function clearThemeColors() {
  const root = document.documentElement

  // Remove inline style overrides to restore CSS defaults
  root.style.removeProperty('--primary')
  root.style.removeProperty('--secondary')
  root.style.removeProperty('--accent')
  root.style.removeProperty('--background')
  root.style.removeProperty('--page-background')
  root.style.removeProperty('--casino-salmon')
  root.style.removeProperty('--casino-blue')
  root.style.removeProperty('--casino-pink')
  root.style.removeProperty('--surface-base')
  root.style.removeProperty('--tile-hover-border')
  root.style.removeProperty('--ring')

  // Clear body background
  document.body.style.background = ''
}

/**
 * Apply font family to CSS variables for site-wide usage
 */
export function applyThemeFont(fontFamily: string) {
  const root = document.documentElement
  root.style.setProperty('--font-family', fontFamily)
  root.style.setProperty('--user-selected-font', fontFamily)
  // Also set on body for broader compatibility
  document.body.style.fontFamily = fontFamily
}

/**
 * Clear font override
 */
export function clearThemeFont() {
  const root = document.documentElement
  root.style.removeProperty('--font-family')
  root.style.removeProperty('--user-selected-font')
  document.body.style.fontFamily = ''
}

interface UseThemeOverrideOptions {
  /** Whether to clear theme on unmount (default: true) */
  clearOnUnmount?: boolean
}

/**
 * Hook to apply PageConfig theme colors and font as CSS variables
 * This propagates the custom casino theme to all Tailwind/shadcn components
 *
 * @param colors - Theme colors from PageConfig
 * @param font - Font family from PageConfig
 * @param options - Configuration options
 */
export function useThemeOverride(
  colors?: ThemeColors,
  font?: string,
  options: UseThemeOverrideOptions = {}
) {
  const { clearOnUnmount = true } = options
  const hasApplied = useRef(false)

  useEffect(() => {
    // Apply colors
    if (colors) {
      applyThemeColors(colors)
      hasApplied.current = true
    }

    // Apply font
    if (font) {
      applyThemeFont(font)
      hasApplied.current = true
    }

    // Cleanup on unmount
    return () => {
      if (clearOnUnmount && hasApplied.current) {
        clearThemeColors()
        clearThemeFont()
      }
    }
  }, [
    colors?.themeColor1,
    colors?.themeColor2,
    colors?.themeColor3,
    colors?.backgroundColor,
    font,
    clearOnUnmount,
  ])
}

export default useThemeOverride
