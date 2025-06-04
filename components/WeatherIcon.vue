<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { WeatherCondition, WeatherIcons, WeatherConditionType } from '@/types/weather'

const props = defineProps<{
  condition: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  dark?: boolean
}>()

const icons: WeatherIcons = {
  'Clear': {
    path: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    class: 'text-yellow-500 dark:text-yellow-400 animate-spin-slow',
    animation: 'sunny'
  },
  'Partly cloudy': {
    path: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
    class: 'text-blue-500 dark:text-blue-400 animate-float',
    animation: 'partly-cloudy'
  },
  'Cloudy': {
    path: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
    class: 'text-gray-500 dark:text-gray-400 animate-bounce-slow',
    animation: 'cloudy'
  },
  'Rain': {
    path: 'M20 7.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-2.5M12 12v6m-4-3l4 3m4-3l-4 3',
    class: 'text-blue-500 dark:text-blue-400 animate-rain',
    animation: 'rainy'
  },
  'Heavy rain': {
    path: 'M20 7.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-2.5M12 12v6m-4-3l4 3m4-3l-4 3',
    class: 'text-blue-600 dark:text-blue-500 animate-heavy-rain',
    animation: 'heavy-rainy'
  },
  'Snow': {
    path: 'M12 2v4m0 12v4M2 12h4m12 0h4M6.343 6.343l2.828 2.828m5.656 5.656l2.828 2.828m-11.312 0l2.828-2.828m5.656-5.656l2.828-2.828M12 8a4 4 0 110 8 4 4 0 010-8z',
    class: 'text-blue-300 dark:text-blue-200 animate-snow',
    animation: 'snowy'
  },
  'Heavy snow': {
    path: 'M12 2v4m0 12v4M2 12h4m12 0h4M6.343 6.343l2.828 2.828m5.656 5.656l2.828 2.828m-11.312 0l2.828-2.828m5.656-5.656l2.828-2.828M12 8a4 4 0 110 8 4 4 0 010-8z',
    class: 'text-blue-200 dark:text-blue-100 animate-heavy-snow',
    animation: 'heavy-snowy'
  },
  'Thunder': {
    path: 'M13 10V3L4 14h7v7l9-11h-7z',
    class: 'text-yellow-500 dark:text-yellow-400 animate-thunder',
    animation: 'thundery'
  },
  'Fog': {
    path: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
    class: 'text-gray-400 dark:text-gray-500'
  },
  'Haze': {
    path: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
    class: 'text-gray-300 dark:text-gray-600'
  }
}

const normalizedCondition = computed(() => {
  const conditionMap: Record<string, WeatherConditionType> = {
    'clear': 'Clear',
    'sunny': 'Clear',
    'partly cloudy': 'Partly cloudy',
    'partly sunny': 'Partly cloudy',
    'cloudy': 'Cloudy',
    'overcast': 'Cloudy',
    'rain': 'Rain',
    'light rain': 'Rain',
    'moderate rain': 'Rain',
    'heavy rain': 'Heavy rain',
    'snow': 'Snow',
    'light snow': 'Snow',
    'heavy snow': 'Heavy snow',
    'thunder': 'Thunder',
    'thunderstorm': 'Thunder',
    'fog': 'Fog',
    'mist': 'Fog',
    'haze': 'Haze',
    'smoke': 'Haze',
    'dust': 'Haze'
  }

  const normalized = props.condition.toLowerCase().trim()
  return conditionMap[normalized] || 'Clear'
})

const icon = computed(() => icons[normalizedCondition.value])

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}

const iconClass = computed(() => sizeClasses[props.size || 'md'])

// Add reduced motion detection
const isReducedMotion = ref(false)

onMounted(() => {
  // Check if user prefers reduced motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  isReducedMotion.value = mediaQuery.matches

  // Listen for changes in user preferences
  mediaQuery.addEventListener('change', (e) => {
    isReducedMotion.value = e.matches
  })
})
</script>

<template>
  <div 
    class="relative"
    :class="[
      size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16',
      animated && icons[normalizedCondition]?.animation ? icons[normalizedCondition].animation : ''
    ]"
  >
    <svg
      class="w-full h-full"
      :class="[
        icons[normalizedCondition]?.class || '',
        dark ? 'dark' : ''
      ]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path :d="icons[normalizedCondition]?.path || ''" />
    </svg>
    
    <!-- Weather-specific decorative elements -->
    <template v-if="animated">
      <!-- Sunny animation -->
      <div v-if="normalizedCondition === 'Clear'" class="absolute inset-0">
        <div class="sun-rays"></div>
      </div>
      
      <!-- Rainy animation -->
      <div v-if="normalizedCondition === 'Rain' || normalizedCondition === 'Heavy rain'" class="absolute inset-0">
        <div class="rain-drops"></div>
      </div>
      
      <!-- Snowy animation -->
      <div v-if="normalizedCondition === 'Snow' || normalizedCondition === 'Heavy snow'" class="absolute inset-0">
        <div class="snowflakes"></div>
      </div>
      
      <!-- Thunder animation -->
      <div v-if="normalizedCondition === 'Thunder'" class="absolute inset-0">
        <div class="lightning-bolt"></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Component-specific styles can be added here if needed */
</style> 