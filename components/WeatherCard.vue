<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t, locale } = useI18n()

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

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

interface Props {
  location: string
  temperature: number
  unit: 'C' | 'F'
  condition: string
  weatherIcon: string
  humidity: number
  windSpeed: number
  windUnit: string
  feelsLike: number
  uvIndex: number
  date: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const formattedDate = computed(() => formatDate(props.date))

const weatherBackgroundClass = computed(() => {
  const condition = props.condition.toLowerCase()
  
  // Clear/Sunny conditions
  if (condition.includes('sunny') || condition.includes('clear')) return 'bg-sunny'
  
  // Cloud conditions
  if (condition.includes('partly cloudy')) return 'bg-partly-cloudy'
  if (condition.includes('cloudy')) return 'bg-cloudy'
  if (condition.includes('overcast')) return 'bg-overcast'
  
  // Rain conditions
  if (condition.includes('heavy rain')) return 'bg-heavy-rain'
  if (condition.includes('moderate rain')) return 'bg-moderate-rain'
  if (condition.includes('light rain')) return 'bg-light-rain'
  if (condition.includes('patchy rain')) return 'bg-patchy-rain'
  if (condition.includes('rain')) return 'bg-rain'
  
  // Snow conditions
  if (condition.includes('heavy snow')) return 'bg-heavy-snow'
  if (condition.includes('moderate snow')) return 'bg-moderate-snow'
  if (condition.includes('light snow')) return 'bg-light-snow'
  if (condition.includes('snow')) return 'bg-snow'
  
  // Drizzle conditions
  if (condition.includes('freezing drizzle')) return 'bg-freezing-drizzle'
  if (condition.includes('light drizzle')) return 'bg-light-drizzle'
  if (condition.includes('drizzle')) return 'bg-drizzle'
  
  // Thunder conditions
  if (condition.includes('thunderstorm')) return 'bg-thunderstorm'
  if (condition.includes('thunder')) return 'bg-thunder'
  
  // Fog/Mist conditions
  if (condition.includes('freezing fog')) return 'bg-freezing-fog'
  if (condition.includes('fog') || condition.includes('mist')) return 'bg-fog'
  
  // Sleet conditions
  if (condition.includes('moderate sleet')) return 'bg-moderate-sleet'
  if (condition.includes('light sleet')) return 'bg-light-sleet'
  if (condition.includes('sleet')) return 'bg-sleet'
  
  // Freezing rain conditions
  if (condition.includes('moderate freezing rain')) return 'bg-moderate-freezing-rain'
  if (condition.includes('light freezing rain')) return 'bg-light-freezing-rain'
  if (condition.includes('freezing rain')) return 'bg-freezing-rain'
  
  // Shower conditions
  if (condition.includes('rain shower')) return 'bg-rain-shower'
  if (condition.includes('snow shower')) return 'bg-snow-shower'
  if (condition.includes('sleet shower')) return 'bg-sleet-shower'
  
  // Other conditions
  if (condition.includes('blowing snow')) return 'bg-blowing-snow'
  if (condition.includes('blizzard')) return 'bg-blizzard'
  if (condition.includes('ice pellets')) return 'bg-ice-pellets'
  
  return 'bg-sunny' // default
})

const weatherConditionClass = computed(() => {
  const condition = props.condition.toLowerCase()
  
  if (condition.includes('clear')) {
    return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
  }
  if (condition.includes('partly cloudy')) {
    return 'border-blue-300 bg-gradient-to-br from-blue-50 to-sky-50'
  }
  if (condition.includes('cloudy')) {
    return 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50'
  }
  if (condition.includes('rain') || condition.includes('drizzle')) {
    return 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50'
  }
  if (condition.includes('snow')) {
    return 'border-blue-200 bg-gradient-to-br from-blue-50 to-white'
  }
  if (condition.includes('thunder')) {
    return 'border-gray-400 bg-gradient-to-br from-gray-50 to-slate-100'
  }
  if (condition.includes('fog') || condition.includes('mist')) {
    return 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
  }
  
  return 'border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50'
})

const weatherInfoClass = computed(() => {
  const condition = props.condition.toLowerCase()
  
  if (condition.includes('clear')) {
    return 'hover:bg-yellow-50/50'
  }
  if (condition.includes('partly cloudy')) {
    return 'hover:bg-blue-50/50'
  }
  if (condition.includes('cloudy')) {
    return 'hover:bg-gray-50/50'
  }
  if (condition.includes('rain') || condition.includes('drizzle')) {
    return 'hover:bg-blue-50/50'
  }
  if (condition.includes('snow')) {
    return 'hover:bg-blue-50/50'
  }
  if (condition.includes('thunder')) {
    return 'hover:bg-gray-50/50'
  }
  if (condition.includes('fog') || condition.includes('mist')) {
    return 'hover:bg-gray-50/50'
  }
  
  return 'hover:bg-blue-50/50'
})
</script>

<template>
  <div 
    class="weather-card"
    :class="weatherBackgroundClass"
  >
    <div class="flex items-start justify-between">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ location }}</h2>
        <p class="text-sm text-gray-700 dark:text-gray-300">{{ formattedDate }}</p>
      </div>
      <div class="weather-icon-animated">
        <img 
          :src="weatherIcon" 
          :alt="t(`weather.conditions.${normalizeCondition(condition)}`)"
          class="w-16 h-16"
        />
      </div>
    </div>

    <div class="mt-6">
      <div class="flex items-baseline space-x-2">
        <span class="text-6xl font-bold text-gray-900 dark:text-white">{{ temperature }}°</span>
        <span class="text-2xl text-gray-700 dark:text-gray-300">{{ unit }}</span>
      </div>
      <p class="mt-2 text-xl text-gray-800 dark:text-gray-200">{{ t(`weather.conditions.${normalizeCondition(condition)}`) }}</p>
    </div>

    <div class="mt-6 grid grid-cols-2 gap-4">
      <div class="space-y-1">
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('weather.humidity') }}</p>
        <p class="text-lg font-medium">{{ humidity }}%</p>
      </div>
      <div class="space-y-1">
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('weather.wind') }}</p>
        <p class="text-lg font-medium">{{ windSpeed }} {{ windUnit }}</p>
      </div>
      <div class="space-y-1">
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('weather.feelsLike') }}</p>
        <p class="text-lg font-medium">{{ feelsLike }}°{{ unit }}</p>
      </div>
      <div class="space-y-1">
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('weather.details.uvIndex') }}</p>
        <p class="text-lg font-medium">{{ uvIndex }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');

.font-comic {
  font-family: 'Comic Neue', cursive;
}

.weather-card {
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
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

.weather-icon {
  transition: transform var(--transition-normal);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.weather-icon:hover {
  transform: scale(1.1) rotate(5deg);
}

.loading-spinner {
  border: 3px solid var(--color-bg-secondary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Weather condition specific styles */
.weather-card[class*="border-yellow"] {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%);
}

.weather-card[class*="border-blue"] {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
}

.weather-card[class*="border-gray"] {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .weather-card {
    padding: var(--spacing-4);
  }
  
  .weather-icon {
    width: 64px;
    height: 64px;
  }
  
  .text-6xl {
    font-size: 3rem;
  }
  
  .text-2xl {
    font-size: 1.25rem;
  }
}
</style> 