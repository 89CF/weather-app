<script setup lang="ts">
import { ref, computed, toRaw, shallowRef, watch, nextTick, defineAsyncComponent, markRaw, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWeather } from '~/composables/useWeather'
import type { WeatherData, WeatherForecast, WeatherAlert as WeatherAlertType } from '@/types/weather'

interface WeatherInfoItem {
  icon: string
  label: string
  value: string | number
  unit: string
  description: string
}

interface AstroInfoItem {
  icon: string
  label: string
  value: string
  class?: string
  description: string
}

const props = defineProps<{
  weather: WeatherData | null
  loading: boolean
  error: string | null
  temperature: number
  temperatureUnit: string
  windSpeed: number
  windSpeedUnit: string
  useMetric: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const { t, locale } = useI18n()
const {
  weather,
  temperature,
  temperatureUnit,
  windSpeed,
  windSpeedUnit,
  useMetric,
  error,
  loading,
  fetchWeather,
  fetchWeatherByLocation
} = useWeather()

// Loading state for refresh button
const isRefreshing = ref(false)

// Lazy load heavy components
const WeatherInfo = defineAsyncComponent(() => import('./WeatherInfo.vue'))
const WeatherAlert = defineAsyncComponent(() => import('./WeatherAlert.vue'))

// Use markRaw for static objects to prevent unnecessary reactivity
const weatherInfoIcons = markRaw({
  wind: 'fas fa-wind text-blue-500',
  humidity: 'fas fa-tint text-blue-500',
  pressure: 'fas fa-compress-alt text-purple-500',
  visibility: 'fas fa-eye text-gray-500',
  uv: 'fas fa-sun text-yellow-500',
  sunrise: 'fas fa-sunrise text-orange-500',
  sunset: 'fas fa-sunset text-orange-500'
})

// Memoize expensive computations
const memoizedFormatTime = (() => {
  const cache = new Map<string, string>()
  return (time: string | undefined) => {
    if (!time) {
      console.warn('memoizedFormatTime: Empty time string received')
      return ''
    }
    
    if (cache.has(time)) {
      console.log('memoizedFormatTime: Using cached value for:', time)
      return cache.get(time)!
    }
    
    try {
      console.log('memoizedFormatTime: Received time string:', time)
      
      // WeatherAPI returns time in format "YYYY-MM-DD HH:MM"
      const [datePart, timePart] = time.split(' ')
      if (!datePart || !timePart) {
        console.error('memoizedFormatTime: Invalid time format - missing date or time part:', { datePart, timePart })
        return ''
      }
      
      const [year, month, day] = datePart.split('-').map(Number)
      const [hours, minutes] = timePart.split(':').map(Number)
      
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
        console.error('memoizedFormatTime: Invalid number in date/time parts:', { year, month, day, hours, minutes })
        return ''
      }
      
      const date = new Date(year, month - 1, day, hours, minutes)
      if (isNaN(date.getTime())) {
        console.error('memoizedFormatTime: Invalid date created:', date)
        return ''
      }
      
      const formatted = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      })
      
      console.log('memoizedFormatTime: Successfully formatted time:', formatted)
      cache.set(time, formatted)
      return formatted
    } catch (error) {
      console.error('memoizedFormatTime: Error formatting time:', error, 'Input:', time)
      return ''
    }
  }
})()

// Use shallowRef for large objects
const weatherInfoItems = shallowRef<WeatherInfoItem[]>([])
const astroInfoItems = shallowRef<AstroInfoItem[]>([])

// Browser detection and specific optimizations
const browserInfo = (() => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : ''
  const isChrome = ua.includes('chrome') && !ua.includes('edg')
  const isFirefox = ua.includes('firefox')
  const isEdge = ua.includes('edg')
  const isSafari = ua.includes('safari') && !ua.includes('chrome')
  const isOpera = ua.includes('opr') || ua.includes('opera')
  
  // Browser-specific performance settings
  const settings = {
    scrollThrottle: isFirefox ? 50 : isSafari ? 32 : 16,
    clickThrottle: isFirefox ? 200 : isSafari ? 250 : 300,
    animationDuration: isFirefox ? 0.3 : isSafari ? 0.4 : 0.5,
    transitionDuration: isFirefox ? 150 : isSafari ? 200 : 250,
    useHardwareAcceleration: isChrome || isEdge,
    useTransform3d: isSafari || isOpera,
    useWillChange: !isSafari, // Safari'de will-change performans sorunlarına neden olabilir
    useBackfaceVisibility: isChrome || isFirefox,
    usePerspective: isChrome || isEdge
  }

  return {
    isChrome,
    isFirefox,
    isEdge,
    isSafari,
    isOpera,
    settings
  }
})()

// Store timeout at component level
const refreshTimeout = shallowRef<number | null>(null)

// Debounce refresh handler
const debouncedRefresh = (() => {
  let timeout: number | null = null
  return async () => {
    if (timeout) {
      window.clearTimeout(timeout)
    }
    timeout = window.setTimeout(async () => {
      if (isRefreshing.value) return
      requestAnimationFrame(() => {
        isRefreshing.value = true
      })
      try {
        await emit('refresh')
      } finally {
        requestAnimationFrame(() => {
          isRefreshing.value = false
        })
      }
    }, 300)
  }
})()

// Optimize event handling with browser-specific settings
const eventHandlers = markRaw({
  scroll: (() => {
    let ticking = false
    let lastScrollTime = 0
    const { scrollThrottle, useHardwareAcceleration } = browserInfo.settings

    return (event: Event) => {
      const now = Date.now()
      if (!ticking && (now - lastScrollTime >= scrollThrottle)) {
        lastScrollTime = now
        window.requestAnimationFrame(() => {
          const target = event.target as HTMLElement
          if (useHardwareAcceleration) {
            target.style.transform = browserInfo.settings.useTransform3d ? 'translate3d(0,0,0)' : 'translateZ(0)'
          }
          ticking = false
        })
        ticking = true
      }
    }
  })(),
  
  click: (() => {
    let lastClick = 0
    const { clickThrottle } = browserInfo.settings
    
    return (event: MouseEvent) => {
      const now = Date.now()
      if (now - lastClick >= clickThrottle) {
        lastClick = now
        event.stopPropagation()
        
        // Browser-specific click handling
        if (browserInfo.isSafari) {
          // Safari için özel click optimizasyonu
          Promise.resolve().then(() => debouncedRefresh())
        } else if (browserInfo.isFirefox) {
          // Firefox için özel click optimizasyonu
          requestAnimationFrame(() => debouncedRefresh())
        } else {
          // Diğer tarayıcılar için standart işlem
          debouncedRefresh()
        }
      }
    }
  })()
})

// Optimize refresh handler with browser-specific settings
const handleRefresh = (() => {
  let isRefreshing = false
  const { animationDuration } = browserInfo.settings
  
  return () => {
    if (isRefreshing || refreshTimeout.value) return
    
    isRefreshing = true
    const timeout = browserInfo.isSafari ? 100 : browserInfo.isFirefox ? 50 : 75
    
    refreshTimeout.value = window.setTimeout(() => {
      if (browserInfo.isSafari) {
        // Safari için özel refresh optimizasyonu
        Promise.resolve().then(() => {
          debouncedRefresh()
          isRefreshing = false
          refreshTimeout.value = null
        })
      } else if (browserInfo.isFirefox) {
        // Firefox için özel refresh optimizasyonu
        requestAnimationFrame(() => {
          debouncedRefresh()
          isRefreshing = false
          refreshTimeout.value = null
        })
      } else {
        // Diğer tarayıcılar için standart işlem
        debouncedRefresh()
        isRefreshing = false
        refreshTimeout.value = null
      }
    }, timeout)
  }
})()

// Clean up event listeners and timeouts
onUnmounted(() => {
  if (refreshTimeout.value) {
    window.clearTimeout(refreshTimeout.value)
  }
})

// Optimize watch with shallow comparison
watch(() => props.weather, (newWeather, oldWeather) => {
  if (!newWeather) return
  
  // Skip update if weather data hasn't changed
  if (oldWeather && 
      newWeather.current.temp_c === oldWeather.current.temp_c &&
      newWeather.current.condition.text === oldWeather.current.condition.text) {
    return
  }
  
  // Batch updates using nextTick
  nextTick(() => {
    // Update weather info items
    weatherInfoItems.value = [
      {
        icon: weatherInfoIcons.wind,
        label: 'weather.current.wind',
        value: props.useMetric ? newWeather.current.wind_kph : newWeather.current.wind_mph,
        unit: props.useMetric ? t('weather.units.kmh') : t('weather.units.mph'),
        description: t('weather.current.windDescription', {
          speed: props.useMetric ? newWeather.current.wind_kph : newWeather.current.wind_mph,
          unit: props.useMetric ? t('weather.units.kmh') : t('weather.units.mph'),
          direction: newWeather.current.wind_dir
        })
      },
      {
        icon: weatherInfoIcons.humidity,
        label: 'weather.current.humidity',
        value: `${newWeather.current.humidity}%`,
        unit: '',
        description: t('weather.current.humidityDescription', {
          value: newWeather.current.humidity
        })
      },
      {
        icon: weatherInfoIcons.pressure,
        label: 'weather.current.pressure',
        value: newWeather.current.pressure_mb,
        unit: t('weather.units.hPa'),
        description: t('weather.current.pressureDescription', {
          value: newWeather.current.pressure_mb,
          unit: t('weather.units.hPa')
        })
      },
      {
        icon: weatherInfoIcons.visibility,
        label: 'weather.current.visibility',
        value: props.useMetric ? newWeather.current.vis_km : newWeather.current.vis_miles,
        unit: props.useMetric ? t('weather.units.km') : t('weather.units.mi'),
        description: t('weather.current.visibilityDescription', {
          value: props.useMetric ? newWeather.current.vis_km : newWeather.current.vis_miles,
          unit: props.useMetric ? t('weather.units.km') : t('weather.units.mi')
        })
      }
    ]
    
    // Update astro items only if forecast data changed
    const forecastDay = newWeather.forecast?.forecast?.forecastday?.[0]?.astro
    if (forecastDay && (!oldWeather?.forecast?.forecast?.forecastday?.[0]?.astro ||
        forecastDay.sunrise !== oldWeather.forecast.forecast.forecastday[0].astro.sunrise ||
        forecastDay.sunset !== oldWeather.forecast.forecast.forecastday[0].astro.sunset)) {
      astroInfoItems.value = [
        {
          icon: weatherInfoIcons.uv,
          label: 'weather.uvIndex',
          value: getUVIndexLevel(newWeather.current.uv),
          class: getUVIndexClass(newWeather.current.uv),
          description: t('weather.uvIndexDescription', {
            level: getUVIndexLevel(newWeather.current.uv),
            value: newWeather.current.uv
          })
        },
        {
          icon: weatherInfoIcons.sunrise,
          label: 'weather.current.sunrise',
          value: memoizedFormatTime(forecastDay.sunrise) || '',
          description: t('weather.current.sunriseDescription', {
            time: memoizedFormatTime(forecastDay.sunrise) || ''
          })
        },
        {
          icon: weatherInfoIcons.sunset,
          label: 'weather.current.sunset',
          value: memoizedFormatTime(forecastDay.sunset) || '',
          description: t('weather.current.sunsetDescription', {
            time: memoizedFormatTime(forecastDay.sunset) || ''
          })
        }
      ]
    } else {
      // If no forecast data, only show UV index
      astroInfoItems.value = [
        {
          icon: weatherInfoIcons.uv,
          label: 'weather.uvIndex',
          value: getUVIndexLevel(newWeather.current.uv),
          class: getUVIndexClass(newWeather.current.uv),
          description: t('weather.uvIndexDescription', {
            level: getUVIndexLevel(newWeather.current.uv),
            value: newWeather.current.uv
          })
        }
      ]
    }
  })
}, { deep: false })

// Utility functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(locale.value, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })
}

const getUVIndexLevel = (uv: number) => {
  if (uv <= 2) return t('weather.alerts.severity.Minor')
  if (uv <= 5) return t('weather.alerts.severity.Moderate')
  if (uv <= 7) return t('weather.alerts.severity.Severe')
  if (uv <= 10) return t('weather.alerts.severity.Severe')
  return t('weather.alerts.severity.Extreme')
}

const getUVIndexClass = (uv: number) => {
  if (uv <= 2) return 'text-green-500'
  if (uv <= 5) return 'text-yellow-500'
  if (uv <= 7) return 'text-orange-500'
  if (uv <= 10) return 'text-red-500'
  return 'text-purple-500'
}

const getAlertId = (alert: WeatherAlertType) => {
  return `${alert.event}-${alert.effective}`
}

const processedAlerts = computed(() => {
  if (!props.weather?.alerts) return []
  const rawWeather = toRaw(props.weather)
  const alerts = rawWeather.alerts?.alert
  if (!alerts) return []
  
  return Array.isArray(alerts) ? alerts : [alerts]
})

const normalizeCondition = (condition: string) => {
  const conditionMap: Record<string, string> = {
    // Clear conditions
    'clear': 'clear',
    'sunny': 'sunny',
    
    // Cloud conditions
    'partly cloudy': 'partlyCloudy',
    'partly sunny': 'partlyCloudy',
    'cloudy': 'cloudy',
    'overcast': 'overcast',
    
    // Rain conditions
    'rain': 'rain',
    'light rain': 'lightRain',
    'moderate rain': 'moderateRain',
    'heavy rain': 'heavyRain',
    'patchy rain': 'patchyRain',
    'patchy light rain': 'patchyLightRain',
    'patchy light rain with thunder': 'patchyLightRainWithThunder',
    'moderate or heavy rain with thunder': 'moderateOrHeavyRainWithThunder',
    
    // Snow conditions
    'snow': 'snow',
    'light snow': 'lightSnow',
    'moderate snow': 'moderateSnow',
    'heavy snow': 'heavySnow',
    'patchy snow': 'patchySnow',
    'patchy light snow': 'patchyLightSnow',
    'patchy light snow with thunder': 'patchyLightSnowWithThunder',
    'moderate or heavy snow with thunder': 'moderateOrHeavySnowWithThunder',
    
    // Drizzle conditions
    'drizzle': 'drizzle',
    'light drizzle': 'lightDrizzle',
    'patchy light drizzle': 'patchyLightDrizzle',
    'freezing drizzle': 'freezingDrizzle',
    'heavy freezing drizzle': 'heavyFreezingDrizzle',
    
    // Thunder conditions
    'thunder': 'thunderstorm',
    'thunderstorm': 'thunderstorm',
    'thundery outbreaks': 'thunderyOutbreaks',
    
    // Fog and mist conditions
    'fog': 'fog',
    'mist': 'mist',
    'haze': 'mist',
    'freezing fog': 'freezingFog',
    
    // Sleet conditions
    'patchy sleet': 'patchySleet',
    'light sleet': 'lightSleet',
    'moderate or heavy sleet': 'moderateOrHeavySleet',
    
    // Freezing rain conditions
    'light freezing rain': 'lightFreezingRain',
    'moderate or heavy freezing rain': 'moderateOrHeavyFreezingRain',
    
    // Shower conditions
    'light rain shower': 'lightRainShower',
    'moderate or heavy rain shower': 'moderateOrHeavyRainShower',
    'torrential rain shower': 'torrentialRainShower',
    'light sleet showers': 'lightSleetShowers',
    'moderate or heavy sleet showers': 'moderateOrHeavySleetShowers',
    'light snow showers': 'lightSnowShowers',
    'moderate or heavy snow showers': 'moderateOrHeavySnowShowers',
    
    // Other conditions
    'blowing snow': 'blowingSnow',
    'blizzard': 'blizzard',
    'ice pellets': 'icePellets',
    'light showers of ice pellets': 'lightShowersOfIcePellets',
    'moderate or heavy showers of ice pellets': 'moderateOrHeavyShowersOfIcePellets'
  }
  
  const normalized = condition.toLowerCase().trim()
  return conditionMap[normalized] || 'clear'
}

// Expose utility functions and computed properties to template
defineExpose({
  formatTime: memoizedFormatTime,
  getUVIndexLevel,
  getUVIndexClass,
  formatDate,
  weatherInfoItems,
  astroInfoItems,
  handleRefresh,
  eventHandlers
})

// Browser-specific style generator
const getBrowserSpecificStyles = (element: 'container' | 'button' | 'icon' | 'default' = 'default', isRefreshing = false) => {
  const { 
    useHardwareAcceleration, 
    useTransform3d, 
    useWillChange, 
    useBackfaceVisibility, 
    usePerspective,
    animationDuration,
    transitionDuration
  } = browserInfo.settings

  const baseStyles: Record<string, string> = {
    transform: useHardwareAcceleration ? (useTransform3d ? 'translate3d(0,0,0)' : 'translateZ(0)') : 'none',
    transition: `all ${transitionDuration}ms ease-in-out`
  }

  if (useWillChange) {
    baseStyles.willChange = 'transform'
  }

  if (useBackfaceVisibility) {
    baseStyles.backfaceVisibility = 'hidden'
  }

  if (usePerspective) {
    baseStyles.perspective = '1000px'
  }

  switch (element) {
    case 'container':
      return {
        ...baseStyles,
        willChange: useWillChange ? 'transform, opacity' : 'auto'
      }
    case 'button':
      return {
        ...baseStyles,
        willChange: useWillChange ? 'transform, background-color' : 'auto'
      }
    case 'icon':
      return {
        ...baseStyles,
        transform: isRefreshing ? 'rotate(360deg)' : 'none',
        transition: `transform ${animationDuration}s linear`,
        willChange: useWillChange ? 'transform' : 'auto'
      }
    default:
      return baseStyles
  }
}
</script>

<template>
  <div v-if="weather" class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Use Suspense for async components -->
    <Suspense>
      <template #default>
        <div class="space-y-4">
          <!-- Error Message -->
          <div v-show="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div class="flex items-center space-x-3">
              <i class="fas fa-exclamation-circle text-red-500 text-xl"></i>
              <p class="text-red-700 dark:text-red-300">{{ error }}</p>
            </div>
          </div>

          <!-- Main Weather Card -->
          <div 
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
            :class="{ 'opacity-50': loading }"
            :style="getBrowserSpecificStyles()"
          >
            <!-- Use passive event listeners and optimize scroll handling -->
            <div 
              class="p-4 sm:p-6" 
              @scroll.passive="eventHandlers.scroll"
              :style="getBrowserSpecificStyles('container')"
            >
              <!-- Current Weather Card -->
              <div class="mb-4 sm:mb-6">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate pr-2">
                    {{ weather.location.name }}, {{ weather.location.country }}
                  </h2>
                  <button 
                    @click.stop="eventHandlers.click"
                    class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="loading || isRefreshing"
                    :aria-label="t('weather.refresh')"
                    :style="getBrowserSpecificStyles('button')"
                  >
                    <i 
                      class="fas fa-sync-alt text-gray-600 dark:text-gray-300"
                      :style="getBrowserSpecificStyles('icon', isRefreshing)"
                    ></i>
                  </button>
                </div>
                <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  {{ formatDate(weather.location.localtime) }}
                </p>
              </div>

              <!-- Main Weather Info -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <!-- Temperature and Condition -->
                <div class="flex items-center space-x-4 sm:space-x-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div class="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                    <WeatherIcon 
                      :condition="weather.current.condition.text"
                      size="lg"
                      :animated="true"
                      class="text-blue-500 w-full h-full transform transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white flex items-baseline">
                      {{ useMetric ? weather.current.temp_c : weather.current.temp_f }}
                      <span class="text-2xl sm:text-3xl ml-1">°</span>
                      <span class="text-lg sm:text-xl font-normal ml-2 text-gray-600 dark:text-gray-400">
                        {{ useMetric ? t('weather.units.celsius') : t('weather.units.fahrenheit') }}
                      </span>
                    </p>
                    <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mt-1">
                      {{ t(`weather.conditions.${normalizeCondition(weather.current.condition.text)}`) }}
                    </p>
                    <p class="text-sm sm:text-base text-gray-500 dark:text-gray-500 mt-1">
                      {{ t('weather.current.feelsLike') }}: 
                      <span class="font-medium">
                        {{ useMetric ? weather.current.feelslike_c : weather.current.feelslike_f }}°
                        {{ useMetric ? t('weather.units.celsius') : t('weather.units.fahrenheit') }}
                      </span>
                    </p>
                  </div>
                </div>

                <!-- Additional Weather Info -->
                <div class="grid grid-cols-2 gap-3 sm:gap-4">
                  <div 
                    v-for="(item, index) in weatherInfoItems" 
                    :key="index"
                    class="group flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-help"
                    :title="item.description"
                  >
                    <i :class="[item.icon, 'text-lg sm:text-xl flex-shrink-0']"></i>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{{ t(item.label) }}</p>
                      <p class="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                        {{ item.value }}
                        <span class="text-sm text-gray-500 dark:text-gray-500">{{ item.unit }}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- UV Index and Sunrise/Sunset -->
              <div 
                v-if="weather.forecast?.forecast?.forecastday?.[0]?.astro" 
                class="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
              >
                <div 
                  v-for="(item, index) in astroInfoItems" 
                  :key="index"
                  class="group flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-help"
                  :title="item.description"
                >
                  <i :class="[item.icon, 'text-lg sm:text-xl flex-shrink-0']"></i>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{{ t(item.label) }}</p>
                    <p 
                      class="text-base sm:text-lg font-medium truncate"
                      :class="item.class || 'text-gray-900 dark:text-white'"
                    >
                      {{ item.value }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lazy loaded components -->
          <WeatherInfo
            v-if="weather"
            :weather="weather"
            :temperature="temperature"
            :temperature-unit="temperatureUnit"
            :wind-speed="windSpeed"
            :wind-speed-unit="windSpeedUnit"
            :use-metric="useMetric"
          />

          <WeatherAlert
            v-if="processedAlerts.length > 0"
            :alerts="processedAlerts"
          />
        </div>
      </template>
      <template #fallback>
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </template>
    </Suspense>

    <!-- Loading Overlay -->
    <div 
      v-if="loading" 
      class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4">
        <i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
        <p class="text-gray-900 dark:text-white">{{ t('weather.loading') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Browser-specific optimizations */
@supports (-webkit-appearance:none) {
  /* Safari-specific styles */
  .animate-spin {
    animation: spin 0.8s linear infinite;
    -webkit-transform: translateZ(0);
  }
  
  .transition-colors {
    transition-duration: 200ms !important;
    -webkit-transition-duration: 200ms !important;
  }
}

@-moz-document url-prefix() {
  /* Firefox-specific styles */
  .animate-spin {
    animation: spin 0.8s linear infinite;
  }
  
  .transition-colors {
    transition-duration: 150ms !important;
  }
}

@supports (-ms-ime-align:auto) {
  /* Edge-specific styles */
  .animate-spin {
    animation: spin 0.9s linear infinite;
  }
}

/* Optimize animations and transitions */
.animate-spin {
  animation: spin 1s linear infinite;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Add reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .transition-colors,
  [style*="transition"] {
    animation: none !important;
    transition: none !important;
  }
}

/* Optimize transitions */
.transition-colors {
  will-change: background-color, border-color, color;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Add hardware acceleration for better performance */
.bg-white,
.bg-gray-50,
.bg-gray-100,
.bg-gray-200,
.bg-gray-700,
.bg-gray-800 {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform;
}

/* Opera-specific optimizations */
@media all and (-webkit-min-device-pixel-ratio:0) and (min-resolution:.001dpcm) {
  .opera {
    transform: translate3d(0,0,0);
    backface-visibility: hidden;
  }
}
</style> 