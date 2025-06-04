import { defineNuxtPlugin } from 'nuxt/app'
import type { NuxtApp } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  // Set initial theme based on system preference
  if (process.client) {
    const colorMode = useColorMode()
    
    // Only set system preference if not already set
    if (!colorMode.preference) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      colorMode.preference = prefersDark ? 'dark' : 'light'
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (colorMode.preference === 'system') {
        colorMode.preference = e.matches ? 'dark' : 'light'
      }
    })
  }

  return {
    provide: {
      theme: {
        toggle: () => {
          const colorMode = useColorMode()
          colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
        },
        set: (theme: 'light' | 'dark' | 'system') => {
          const colorMode = useColorMode()
          colorMode.preference = theme
        }
      }
    }
  }
}) 