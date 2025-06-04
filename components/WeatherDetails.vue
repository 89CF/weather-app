<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { WeatherData } from '@/types/weather'
import WeatherIcon from './WeatherIcon.vue'

const props = defineProps<{
  weather: WeatherData
}>()

const { t } = useI18n()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const formatTime = (time: string) => {
  if (!time) {
    console.warn('formatTime: Empty time string received')
    return ''
  }
  
  try {
    console.log('formatTime: Received time string:', time)
    
    // Check if the time is in 12-hour format (HH:MM AM/PM)
    if (time.includes('AM') || time.includes('PM')) {
      // Convert 12-hour format to 24-hour format
      const [timePart, period] = time.split(' ')
      const [hours, minutes] = timePart.split(':').map(Number)
      
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('formatTime: Invalid time format in 12-hour format:', { hours, minutes })
        return ''
      }
      
      let hour24 = hours
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0
      }
      
      return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
    
    // Handle 24-hour format (YYYY-MM-DD HH:MM)
    const [datePart, timePart] = time.split(' ')
    if (!datePart || !timePart) {
      console.error('formatTime: Invalid time format - missing date or time part:', { datePart, timePart })
      return ''
    }
    
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes] = timePart.split(':').map(Number)
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      console.error('formatTime: Invalid number in date/time parts:', { year, month, day, hours, minutes })
      return ''
    }
    
    const date = new Date(year, month - 1, day, hours, minutes)
    if (isNaN(date.getTime())) {
      console.error('formatTime: Invalid date created:', date)
      return ''
    }
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  } catch (error) {
    console.error('formatTime: Error formatting time:', error, 'Input:', time)
    return ''
  }
}

const getWindDirection = (degree: number) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degree / 45) % 8
  return directions[index]
}

const getUVIndexLevel = (uv: number) => {
  if (uv <= 2) return { level: 'low', color: 'text-green-500' }
  if (uv <= 5) return { level: 'moderate', color: 'text-yellow-500' }
  if (uv <= 7) return { level: 'high', color: 'text-orange-500' }
  if (uv <= 10) return { level: 'veryHigh', color: 'text-red-500' }
  return { level: 'extreme', color: 'text-purple-500' }
}

const uvIndex = computed(() => getUVIndexLevel(props.weather.current.uv))
</script>

<template>
  <div class="weather-details glass">
    <h3 class="text-2xl font-comic font-bold text-gradient mb-6">{{ t('weather.details.title') }}</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Sunrise & Sunset -->
      <div class="col-span-1 md:col-span-2 lg:col-span-3">
        <div class="glass p-6 rounded-xl">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <i class="fas fa-sunrise text-orange-500 text-2xl"></i>
              </div>
              <div>
                <p class="text-sm font-comic text-gray-500 dark:text-gray-400">{{ t('weather.details.sunrise') }}</p>
                <p class="text-xl font-comic font-bold text-gray-800 dark:text-gray-200">
                  {{ weather.forecast?.forecast?.forecastday[0]?.astro?.sunrise ? formatTime(weather.forecast.forecast.forecastday[0].astro.sunrise) : '-' }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <i class="fas fa-sunset text-orange-500 text-2xl"></i>
              </div>
              <div>
                <p class="text-sm font-comic text-gray-500 dark:text-gray-400">{{ t('weather.details.sunset') }}</p>
                <p class="text-xl font-comic font-bold text-gray-800 dark:text-gray-200">
                  {{ weather.forecast?.forecast?.forecastday[0]?.astro?.sunset ? formatTime(weather.forecast.forecast.forecastday[0].astro.sunset) : '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Wind -->
      <div class="glass p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <i class="fas fa-wind text-blue-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm font-comic text-gray-500 dark:text-gray-400">{{ t('weather.details.wind') }}</p>
            <p class="text-lg font-comic font-bold text-gray-800 dark:text-gray-200">
              {{ weather.current.wind_kph }} km/h
              <span class="text-sm text-gray-500 dark:text-gray-400">
                ({{ getWindDirection(weather.current.wind_degree) }})
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- UV Index -->
      <div class="glass p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <i class="fas fa-sun text-yellow-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm font-comic text-gray-500 dark:text-gray-400">{{ t('weather.details.uvIndex') }}</p>
            <p class="text-lg font-comic font-bold" :class="uvIndex.color">
              {{ weather.current.uv }} ({{ t(`weather.details.uvLevels.${uvIndex.level}`) }})
            </p>
          </div>
        </div>
      </div>

      <!-- Visibility -->
      <div class="glass p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <i class="fas fa-eye text-purple-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm font-comic text-gray-500 dark:text-gray-400">{{ t('weather.details.visibility') }}</p>
            <p class="text-lg font-comic font-bold text-gray-800 dark:text-gray-200">
              {{ weather.current.vis_km }} km
            </p>
          </div>
        </div>
      </div>

      <!-- Pressure -->
      <div class="glass p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <i class="fas fa-compress-alt text-purple-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm font-comic text-gray-500 dark:text-gray-400">{{ t('weather.details.pressure') }}</p>
            <p class="text-lg font-comic font-bold text-gray-800 dark:text-gray-200">
              {{ weather.current.pressure_mb }} mb
            </p>
          </div>
        </div>
      </div>

      <!-- Moon Phase -->
      <div class="glass p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <i class="fas fa-moon text-indigo-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm font-comic text-gray-500 dark:text-gray-400">{{ t('weather.details.moonPhase') }}</p>
            <p class="text-lg font-comic font-bold text-gray-800 dark:text-gray-200">
              {{ weather.forecast?.forecast?.forecastday[0]?.astro?.moon_phase || '-' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Moonrise -->
      <div class="glass p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <i class="fas fa-moon text-indigo-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm font-comic text-gray-500 dark:text-gray-400">{{ t('weather.details.moonrise') }}</p>
            <p class="text-lg font-comic font-bold text-gray-800 dark:text-gray-200">
              {{ weather.forecast?.forecast?.forecastday[0]?.astro?.moonrise ? formatTime(weather.forecast.forecast.forecastday[0].astro.moonrise) : '-' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');

.font-comic {
  font-family: 'Comic Neue', cursive;
}

.weather-details {
  position: relative;
  overflow: hidden;
}

.weather-details::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%);
  pointer-events: none;
}

.dark .weather-details::before {
  background: radial-gradient(circle at top right, rgba(255,255,255,0.05) 0%, transparent 70%);
}

/* UV Index colors */
.uv-low { color: #10b981; }
.uv-moderate { color: #f59e0b; }
.uv-high { color: #f97316; }
.uv-very-high { color: #ef4444; }
.uv-extreme { color: #7c3aed; }

/* Responsive adjustments */
@media (max-width: 640px) {
  .weather-details {
    padding: var(--spacing-4);
  }
  
  .text-2xl {
    font-size: 1.5rem;
  }
  
  .text-xl {
    font-size: 1.25rem;
  }
  
  .text-lg {
    font-size: 1.125rem;
  }
}
</style> 