<template>
  <div>
    <!-- Weather Background -->
    <div 
      class="fixed inset-0 transition-colors duration-500"
      :class="weatherBackgroundClass"
    ></div>

    <!-- Content Layer -->
    <div class="relative z-10">
      <div class="container mx-auto px-4 py-8">
        <!-- Search Section -->
        <div class="max-w-md mx-auto mb-8">
          <WeatherSearch
            @search="handleSearch"
            @location-search="handleLocationSearch"
            class="weather-card"
          />
        </div>

        <!-- Weather Display Section -->
        <template v-if="weather">
          <Transition name="fade" mode="out-in">
            <div class="space-y-8">
              <!-- Main Weather Card -->
              <WeatherCard
                :location="weather.location.name"
                :temperature="temperature"
                :unit="temperatureUnit as 'C' | 'F'"
                :condition="weather.current.condition.text"
                :weather-icon="weather.current.condition.icon"
                :humidity="weather.current.humidity"
                :wind-speed="windSpeed"
                :wind-unit="windSpeedUnit"
                :feels-like="weather.current.feelslike_c"
                :uv-index="weather.current.uv"
                :date="formatDate(weather.current.last_updated)"
              />

              <!-- Forecast Section -->
              <div class="mt-8">
                <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{{ t('weather.forecast.threeDay') }}</h2>
                <div class="scroll-container">
                  <template v-if="weather.forecast?.forecast?.forecastday?.length">
                    <ForecastCard
                      v-for="day in weather.forecast.forecast.forecastday"
                      :key="day.date"
                      :day="formatDay(day.date)"
                      :date="formatDate(day.date)"
                      :weather-icon="day.day.condition.icon"
                      :condition="day.day.condition.text"
                      :max-temp="day.day.maxtemp_c"
                      :min-temp="day.day.mintemp_c"
                    />
                  </template>
                  <template v-else>
                    <div class="text-center p-4">
                      <p class="text-gray-600 dark:text-gray-400">Forecast data not available</p>
                      <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Debug info: {{ JSON.stringify(weather.forecast, null, 2) }}
                      </p>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </Transition>
        </template>

        <!-- Loading State -->
        <div v-else-if="loading" class="flex justify-center items-center py-12">
          <div class="loading-pulse">
            <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Error Display -->
        <Transition name="fade">
          <div 
            v-if="error" 
            class="weather-card text-center"
          >
            <p class="text-lg font-medium text-red-600 dark:text-red-400">{{ error }}</p>
            <button 
              @click="handleRefresh" 
              class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {{ t('common.retry') }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWeather } from '~/composables/useWeather'
import { useI18n } from 'vue-i18n'
import type { WeatherData } from '@/types/weather'

const { t } = useI18n()
const {
  weather,
  loading,
  error,
  temperature,
  temperatureUnit,
  windSpeed,
  windSpeedUnit,
  useMetric,
  fetchWeather,
  fetchWeatherByLocation
} = useWeather()

const handleSearch = async (city: string) => {
  try {
    console.log('Searching for city:', city)
    const result = await fetchWeather(city)
    console.log('Search result forecast:', {
      hasForecast: !!result.forecast,
      forecastKeys: result.forecast ? Object.keys(result.forecast) : [],
      forecastData: result.forecast
    })
  } catch (err) {
    console.error('Error fetching weather:', err)
  }
}

const handleLocationSearch = async () => {
  try {
    console.log('Searching by location')
    const result = await fetchWeatherByLocation()
    console.log('Location search result forecast:', {
      hasForecast: !!result.forecast,
      forecastKeys: result.forecast ? Object.keys(result.forecast) : [],
      forecastData: result.forecast
    })
  } catch (err) {
    console.error('Error fetching weather by location:', err)
  }
}

const handleRefresh = async () => {
  try {
    if (weather.value?.location.name) {
      await fetchWeather(weather.value.location.name)
    } else {
      await fetchWeatherByLocation()
    }
  } catch (err) {
    console.error('Error refreshing weather:', err)
  }
}

const weatherBackgroundClass = computed(() => {
  if (!weather.value) return 'bg-sunny'
  
  const condition = weather.value.current.condition.text.toLowerCase()
  if (condition.includes('sunny') || condition.includes('clear')) return 'bg-sunny'
  if (condition.includes('rain') || condition.includes('drizzle')) return 'bg-rainy'
  if (condition.includes('cloud')) return 'bg-cloudy'
  if (condition.includes('snow')) return 'bg-snowy'
  return 'bg-sunny'
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const formatDay = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short'
  })
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');

.font-comic {
  font-family: 'Comic Neue', cursive;
}

.hover\:scale-102:hover {
  transform: scale(1.02);
}

/* Weather card specific styles */
.weather-card {
  position: relative;
  overflow: hidden;
}

.weather-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%);
  pointer-events: none;
}

.dark .weather-card::before {
  background: radial-gradient(circle at top right, rgba(255,255,255,0.05) 0%, transparent 70%);
}

/* Weather icon animation */
.weather-icon {
  transition: transform var(--transition-normal);
}

.weather-icon:hover {
  transform: scale(1.1) rotate(5deg);
}

/* Loading animation */
.loading-spinner {
  border: 3px solid var(--color-bg-secondary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .container {
    padding-left: var(--spacing-4);
    padding-right: var(--spacing-4);
  }
  
  .card {
    padding: var(--spacing-4);
  }
}
</style>