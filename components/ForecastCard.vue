<template>
  <div 
    class="weather-card"
    :class="weatherBackgroundClass"
  >
    <div class="flex items-start justify-between h-20">
      <div class="space-y-1 flex-1">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">{{ formattedDay }}</h2>
        <p class="text-xs text-gray-700 dark:text-gray-300">{{ formattedDate }}</p>
      </div>
      <div class="icon-wrapper">
        <div class="icon-container">
          <img 
            :src="weatherIcon" 
            :alt="t(`weather.conditions.${normalizeCondition(condition)}`)"
            class="weather-icon"
          />
        </div>
      </div>
    </div>

    <div class="mt-4 h-24">
      <div class="flex items-baseline space-x-2">
        <span class="text-5xl font-bold text-gray-900 dark:text-white">{{ maxTemp }}°</span>
        <span class="text-xl text-gray-700 dark:text-gray-300">{{ minTemp }}°</span>
      </div>
      <p class="mt-1 text-lg text-gray-800 dark:text-gray-200 truncate">{{ t(`weather.conditions.${normalizeCondition(condition)}`) }}</p>
    </div>
  </div>
</template>

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

const formatDay = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long'
  }).format(date)
}

const normalizeCondition = (condition: string) => {
  const conditionMap: Record<string, string> = {
    'clear': 'clear',
    'sunny': 'sunny',
    'partly cloudy': 'partlyCloudy',
    'partly sunny': 'partlyCloudy',
    'cloudy': 'cloudy',
    'overcast': 'overcast',
    'rain': 'rain',
    'light rain': 'lightRain',
    'moderate rain': 'moderateRain',
    'heavy rain': 'heavyRain',
    'patchy rain': 'patchyRain',
    'patchy light rain': 'patchyLightRain',
    'patchy light rain with thunder': 'patchyLightRainWithThunder',
    'moderate or heavy rain with thunder': 'moderateOrHeavyRainWithThunder',
    'snow': 'snow',
    'light snow': 'lightSnow',
    'moderate snow': 'moderateSnow',
    'heavy snow': 'heavySnow',
    'patchy snow': 'patchySnow',
    'patchy light snow': 'patchyLightSnow',
    'patchy light snow with thunder': 'patchyLightSnowWithThunder',
    'moderate or heavy snow with thunder': 'moderateOrHeavySnowWithThunder',
    'drizzle': 'drizzle',
    'light drizzle': 'lightDrizzle',
    'patchy light drizzle': 'patchyLightDrizzle',
    'freezing drizzle': 'freezingDrizzle',
    'heavy freezing drizzle': 'heavyFreezingDrizzle',
    'thunder': 'thunderstorm',
    'thunderstorm': 'thunderstorm',
    'thundery outbreaks': 'thunderyOutbreaks',
    'fog': 'fog',
    'mist': 'mist',
    'haze': 'mist',
    'freezing fog': 'freezingFog',
    'patchy sleet': 'patchySleet',
    'light sleet': 'lightSleet',
    'moderate or heavy sleet': 'moderateOrHeavySleet',
    'light freezing rain': 'lightFreezingRain',
    'moderate or heavy freezing rain': 'moderateOrHeavyFreezingRain',
    'light rain shower': 'lightRainShower',
    'moderate or heavy rain shower': 'moderateOrHeavyRainShower',
    'torrential rain shower': 'torrentialRainShower',
    'light sleet showers': 'lightSleetShowers',
    'moderate or heavy sleet showers': 'moderateOrHeavySleetShowers',
    'light snow showers': 'lightSnowShowers',
    'moderate or heavy snow showers': 'moderateOrHeavySnowShowers',
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
  day: string
  date: string
  weatherIcon: string
  condition: string
  maxTemp: number
  minTemp: number
}

const props = defineProps<Props>()

const formattedDate = computed(() => formatDate(props.date))
const formattedDay = computed(() => formatDay(props.date))

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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');

.font-comic {
  font-family: 'Comic Neue', cursive;
}

.weather-card {
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
  height: 200px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
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

.icon-wrapper {
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  margin-left: 1rem;
}

.icon-container {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 0 0 auto;
}

.weather-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
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
    height: 180px;
    padding: 0.75rem;
  }
  
  .icon-wrapper {
    width: 64px;
    height: 64px;
    flex: 0 0 64px;
  }
  
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .text-xl {
    font-size: 1.25rem;
  }
}
</style> 