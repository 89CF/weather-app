import { ref, computed, shallowRef } from 'vue'
import { toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWeatherStore } from '@/stores/weather'
import type { WeatherData } from '@/types/weather'

export const useWeather = () => {
  const { locale, t } = useI18n()
  const config = useRuntimeConfig()

  // Initialize store
  const weatherStore = useWeatherStore()
  const weather = shallowRef<WeatherData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const useMetric = ref(true)

  const temperature = computed(() => {
    if (!weather.value) return 0
    return useMetric.value ? weather.value.current.temp_c : weather.value.current.temp_f
  })

  const windSpeed = computed(() => {
    if (!weather.value) return 0
    return useMetric.value ? weather.value.current.wind_kph : weather.value.current.wind_mph
  })

  const temperatureUnit = computed(() => useMetric.value ? 'C' : 'F')
  const windSpeedUnit = computed(() => useMetric.value ? 'km/h' : 'mph')

  // API methods
  const fetchWithRetry = async (url: string, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Attempting to fetch from: ${url}`)
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const contentType = response.headers.get('content-type')
          let errorMessage = `HTTP error! status: ${response.status}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorData.error?.message || errorMessage
          } catch (e) {
            const text = await response.text()
            if (text.includes('<!DOCTYPE')) {
              errorMessage = 'Received HTML instead of JSON. The server might be misconfigured.'
            }
          }
          throw new Error(errorMessage)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          const text = await response.text()
          throw new Error(`Invalid response format: Expected JSON but got ${contentType}`)
        }

        const data = await response.json()
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format: Expected an object')
        }
        return data
      } catch (e) {
        console.error(`Attempt ${i + 1} failed:`, e)
        if (i === retries - 1) throw e
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  const fetchWeather = async (city: string) => {
    loading.value = true
    error.value = null
    try {
      const baseUrl = config.public.apiBase
      const url = `${baseUrl}/weather?city=${encodeURIComponent(city)}`
      
      console.log('Fetching weather for city:', city)
      const data = await fetchWithRetry(url)
      
      if (!data.current?.location || !data.current?.current) {
        throw new Error('Invalid weather data structure')
      }

      // Ensure forecast data is in the correct structure
      const forecastData = data.forecast || {
        forecastday: []
      }

      const weatherData = {
        location: data.current.location,
        current: data.current.current,
        forecast: {
          forecast: {
            forecastday: forecastData.forecastday || []
          }
        },
        alerts: data.current.alerts || null
      } as WeatherData

      // Update store and local state
      weather.value = weatherData
      weatherStore.updateWeather(weatherData)
      
      return weatherData
    } catch (e) {
      console.error('Error fetching weather:', e)
      if (e instanceof Error) {
        if (e.message.includes('Invalid API key')) {
          error.value = 'Weather service configuration error. Please try again later.'
        } else if (e.message.includes('City not found')) {
          error.value = 'City not found. Please check the spelling and try again.'
        } else if (e.message.includes('ECONNRESET')) {
          error.value = 'Connection to weather service was reset. Please try again.'
        } else if (e.message.includes('Invalid response format')) {
          error.value = 'Received invalid data from weather service. Please try again.'
        } else {
          error.value = `Failed to fetch weather data: ${e.message}`
        }
      } else {
        error.value = 'An unexpected error occurred while fetching weather data'
      }
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const fetchWeatherByLocation = async () => {
    loading.value = true
    error.value = null
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        })
      })
      
      const { latitude, longitude } = position.coords
      const baseUrl = config.public.apiBase
      console.log('Fetching weather for location:', { latitude, longitude })
      const data = await fetchWithRetry(`${baseUrl}/weather/location?lat=${latitude}&lon=${longitude}`)
      console.log('Location API Response:', {
        hasForecast: !!data.forecast,
        forecastKeys: data.forecast ? Object.keys(data.forecast) : [],
        forecastday: data.forecast?.forecastday
      })
      
      if (!data.current?.location || !data.current?.current) {
        throw new Error('Invalid weather data structure')
      }

      const weatherData = {
        location: data.current.location,
        current: data.current.current,
        forecast: data.forecast || {
          forecast: {
            forecastday: []
          }
        },
        alerts: data.current.alerts || null
      } as WeatherData

      // Update store and local state
      weather.value = weatherData
      weatherStore.updateWeather(weatherData)
      
      return weatherData
    } catch (e) {
      console.error('Error fetching weather by location:', e)
      if (e instanceof Error) {
        error.value = `Failed to fetch weather data: ${e.message}`
      } else {
        error.value = 'An unexpected error occurred while fetching weather data'
      }
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const toggleUnit = () => {
    useMetric.value = !useMetric.value
    weatherStore.toggleUnit()
  }

  return {
    weather,
    loading,
    error,
    useMetric,
    temperature,
    temperatureUnit,
    windSpeed,
    windSpeedUnit,
    fetchWeather,
    fetchWeatherByLocation,
    toggleUnit
  }
} 