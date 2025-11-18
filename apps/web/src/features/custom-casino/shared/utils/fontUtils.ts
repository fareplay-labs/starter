// @ts-nocheck
import { useEffect, useState } from 'react'

// Available font options with proper fallbacks
export const fontOptions = [
  { value: 'Arial, Helvetica, sans-serif', label: 'Default (Arial)', isDefault: true },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Gohu, monospace', label: 'Gohu' },
  { value: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif", label: 'Inter' },
  { value: "'Roboto', Arial, sans-serif", label: 'Roboto' },
  { value: "'Roboto Mono', 'Courier New', monospace", label: 'Roboto Mono' },
  { value: "'Montserrat', 'Segoe UI', Tahoma, sans-serif", label: 'Montserrat' },
  { value: "'Poppins', 'Helvetica Neue', Helvetica, sans-serif", label: 'Poppins' },
  { value: "'Open Sans', 'Trebuchet MS', sans-serif", label: 'Open Sans' },
  { value: "'Lato', 'Lucida Grande', 'Lucida Sans Unicode', sans-serif", label: 'Lato' },
  { value: "'Oswald', Impact, sans-serif", label: 'Oswald' },
  { value: "'Quicksand', 'Century Gothic', sans-serif", label: 'Quicksand' },
  { value: "'Playfair Display', 'Times New Roman', serif", label: 'Playfair Display' },
  { value: "'JetBrains Mono', 'Lucida Console', monospace", label: 'JetBrains Mono' },
]

// Helper to load Google Font
export async function loadGoogleFont(font: string): Promise<void> {
  try {
    // Skip if font is already loaded
    if (document.fonts.check(`12px "${font}"`)) {
      return
    }

    // Clean the font name for Google Fonts API
    const cleanFont = font.replace(/\s+/g, '+')

    // Check if the font link already exists
    const existingLink = document.querySelector(`link[href*="${cleanFont}"]`)
    if (existingLink) {
      return
    }

    // Create a new link element
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${cleanFont}&display=swap`
    link.rel = 'stylesheet'

    // Create a promise that resolves when the font is loaded
    const fontLoadPromise = new Promise<void>((resolve, reject) => {
      link.onload = () => {
        // Create a temporary element to force font loading
        const tempElement = document.createElement('div')
        tempElement.style.fontFamily = font
        tempElement.style.opacity = '0'
        tempElement.textContent = 'Font loading test'
        document.body.appendChild(tempElement)

        // Allow a brief moment for the font to be processed
        setTimeout(() => {
          document.body.removeChild(tempElement)
          resolve()
        }, 100)
      }
      link.onerror = () => {
        console.error(`Error loading font ${font}`)
        reject(new Error(`Failed to load font: ${font}`))
      }
    })

    // Append the link to the document
    document.head.appendChild(link)

    // Wait for the font to load
    await fontLoadPromise
  } catch (error) {
    console.error(`Error in loadGoogleFont for ${font}:`, error)
  }
}

/**
 * Hook to preload all Google fonts
 */
export const usePreloadFonts = (immediate = false) => {
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true

    const preloadFonts = async () => {
      try {
        // Get all Google fonts from options
        const googleFonts = fontOptions
          .filter(
            font =>
              font.value !== 'inherit' &&
              !font.value.includes('monospace') &&
              !font.value.includes('sans-serif') &&
              !font.value.includes('serif')
          )
          .map(font => font.value)

        // Load them all in parallel with a slight delay between batches
        const batchSize = 5 // Load 5 fonts at a time to avoid rate limiting

        for (let i = 0; i < googleFonts.length; i += batchSize) {
          const batch = googleFonts.slice(i, i + batchSize)
          await Promise.all(batch.map(font => loadGoogleFont(font)))

          // Small delay between batches
          if (i + batchSize < googleFonts.length) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }

        if (isMounted) {
          setFontsLoaded(true)
        }
      } catch (error) {
        console.error('Error preloading fonts:', error)
        if (isMounted) {
          setFontsLoaded(true) // Mark as loaded even on error to prevent blocking the app
        }
      }
    }

    if (immediate) {
      preloadFonts()
    } else {
      // Delay font preloading to prioritize application startup
      const timer = setTimeout(() => {
        preloadFonts()
      }, 2000)

      return () => {
        clearTimeout(timer)
      }
    }

    return () => {
      isMounted = false
    }
  }, [immediate])

  return fontsLoaded
}

/**
 * Apply selected font to the document
 */
export const applyFontToPage = (fontFamily: string) => {
  // Set CSS variable for the entire application
  document.documentElement.style.setProperty('--user-selected-font', fontFamily)

  // Set a data attribute on the root element for easier targeting in CSS
  document.documentElement.setAttribute('data-font', fontFamily)

  // Apply font family directly to body element to ensure it cascades
  document.body.style.setProperty('--app-font-family', fontFamily)

  // Set a forced font-family on all user-page-content elements
  const userPageContent = document.querySelector('.user-page-content')
  if (userPageContent) {
    userPageContent.setAttribute('style', `font-family: ${fontFamily} !important`)
  }

  // Force update any style element with the font family
  const styleEl = document.querySelector('style#dynamic-font-style')
  if (styleEl) {
    styleEl.textContent = `
      .user-page-content, .user-page-content *:not(.font-selector-button) {
        font-family: ${fontFamily} !important;
      }
      .font-selector-button {
        /* Font selector buttons maintain their own fonts */
      }
    `
  } else {
    // Create a style element if it doesn't exist
    const newStyle = document.createElement('style')
    newStyle.id = 'dynamic-font-style'
    newStyle.textContent = `
      .user-page-content, .user-page-content *:not(.font-selector-button) {
        font-family: ${fontFamily} !important;
      }
      .font-selector-button {
        /* Font selector buttons maintain their own fonts */
      }
    `
    document.head.appendChild(newStyle)
  }

  // Trigger a font-change event for components that might need to respond
  const event = new CustomEvent('fontchange', { detail: { fontFamily } })
  document.dispatchEvent(event)
}
