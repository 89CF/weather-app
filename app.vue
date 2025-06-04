<template>
  <div 
    class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-500"
    :class="weatherBackgroundClass"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Root app component
const colorMode = useColorMode()
const route = useRoute()
const weatherStore = useWeatherStore()
const currentWeather = computed(() => weatherStore.currentWeather)

// Handle Chrome DevTools paths
onMounted(() => {
  if (route.path.includes('/.well-known/appspecific/')) {
    // Silently handle Chrome DevTools paths
    return
  }
})

useHead({
  titleTemplate: '%s - Weather Forecast',
  meta: [
    { name: 'description', content: 'Modern weather forecast application with 3D animations and multilingual support' },
    { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: '#1f2937', media: '(prefers-color-scheme: dark)' }
  ],
  htmlAttrs: {
    lang: 'en',
    class: computed(() => colorMode.value)
  },
  bodyAttrs: {
    class: 'antialiased'
  }
})

const weatherBackgroundClass = computed(() => {
  if (!currentWeather.value) return ''

  const condition = currentWeather.value.current.condition.text.toLowerCase()
  
  // Clear/Sunny conditions
  if (condition.includes('sunny') || condition.includes('clear')) {
    return 'bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-orange-900 dark:to-yellow-900'
  }
  
  // Cloud conditions
  if (condition.includes('partly cloudy')) {
    return 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800'
  }
  if (condition.includes('cloudy') || condition.includes('overcast')) {
    return 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
  }
  
  // Rain conditions
  if (condition.includes('rain')) {
    return 'bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700'
  }
  
  // Snow conditions
  if (condition.includes('snow')) {
    return 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700'
  }
  
  // Thunder conditions
  if (condition.includes('thunder')) {
    return 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600'
  }
  
  // Fog/Mist conditions
  if (condition.includes('fog') || condition.includes('mist')) {
    return 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
  }
  
  // Default
  return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800'
})
</script>

<style>
@import '~/assets/css/main.css';
@import '~/assets/css/theme.css';
@import '~/assets/css/weather.css';

:root {
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color-scheme: light dark;
}

body {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Initial page load animation */
.fade-enter-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from {
  opacity: 0;
}

/* Enhanced page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

/* Weather card styles */
.weather-card {
  @apply rounded-2xl shadow-lg backdrop-blur-lg bg-white/10 dark:bg-gray-800/10 p-6 transition-all duration-300;
}

.weather-card:hover {
  @apply transform scale-[1.02] shadow-xl;
}

/* Weather icon animations */
.weather-icon {
  @apply transition-transform duration-300;
}

.weather-icon:hover {
  @apply transform scale-110;
}

/* Horizontal scroll container */
.scroll-container {
  @apply flex overflow-x-auto pb-4 space-x-4;
  scroll-snap-type: x mandatory;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scroll-container::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* Forecast card styles */
.forecast-card {
  @apply flex-shrink-0 w-32 rounded-xl p-4 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg;
  scroll-snap-align: start;
}

/* Weather condition backgrounds */
.bg-sunny {
  @apply bg-gradient-to-br from-blue-400 to-yellow-300;
}

.bg-rainy {
  @apply bg-gradient-to-br from-gray-400 to-blue-500;
}

.bg-cloudy {
  @apply bg-gradient-to-br from-gray-300 to-blue-400;
}

.bg-snowy {
  @apply bg-gradient-to-br from-blue-200 to-white;
}

/* Loading animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Weather icon animations */
@keyframes weather-icon-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.weather-icon-animated {
  animation: weather-icon-float 3s ease-in-out infinite;
}

/* Mobile navigation */
.mobile-nav {
  @apply fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700;
}

.mobile-nav-item {
  @apply flex flex-col items-center justify-center p-2 text-sm transition-colors duration-200;
}

.mobile-nav-item.active {
  @apply text-blue-600 dark:text-blue-400;
}
</style> 