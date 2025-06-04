<script setup lang="ts">
import { ref } from 'vue'
import { useWeather } from '~/composables/useWeather'

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

const currentCity = ref('')

const handleSearch = async (city: string) => {
  currentCity.value = city
  await fetchWeather(city)
}

const handleRefresh = async () => {
  if (currentCity.value?.trim()) {
    await fetchWeather(currentCity.value.trim())
  } else {
    await fetchWeatherByLocation()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">
        {{ $t('weather.search.title') }}
      </h1>
      
      <WeatherSearch @search="handleSearch" />
      
      <div class="mt-8">
        <WeatherDisplay
          :weather="weather"
          :loading="loading"
          :error="error"
          :temperature="temperature"
          :temperature-unit="temperatureUnit"
          :wind-speed="windSpeed"
          :wind-speed-unit="windSpeedUnit"
          :use-metric="useMetric"
          @refresh="handleRefresh"
        />
      </div>
    </div>
  </div>
</template> 