import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type { WeatherData } from '@/types/weather'

export const useWeatherStore = defineStore('weather', () => {
  const currentWeather = ref<WeatherData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const useMetric = ref(true)

  const temperature = computed(() => {
    if (!currentWeather.value?.current) return null
    return useMetric.value ? currentWeather.value.current.temp_c : currentWeather.value.current.temp_f
  })

  const temperatureUnit = computed(() => useMetric.value ? '°C' : '°F')

  const windSpeed = computed(() => {
    if (!currentWeather.value?.current) return null
    return useMetric.value ? currentWeather.value.current.wind_kph : currentWeather.value.current.wind_mph
  })

  const windSpeedUnit = computed(() => useMetric.value ? 'km/h' : 'mph')

  function toggleUnit() {
    useMetric.value = !useMetric.value
  }

  function updateWeather(data: WeatherData) {
    currentWeather.value = data
  }

  return {
    // State - use computed to ensure we return plain values
    currentWeather: computed(() => toRaw(currentWeather.value)),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    useMetric: computed(() => useMetric.value),

    // Computed - already computed properties
    temperature,
    temperatureUnit,
    windSpeed,
    windSpeedUnit,

    // Actions
    toggleUnit,
    updateWeather
  }
}) 