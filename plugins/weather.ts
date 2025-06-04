import { defineNuxtPlugin } from 'nuxt/app'
import type { NuxtApp } from 'nuxt/app'
import { useWeatherStore } from '@/stores/weather'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const weatherStore = useWeatherStore()

  // Provide weather store to the app
  return {
    provide: {
      weather: weatherStore
    }
  }
}) 