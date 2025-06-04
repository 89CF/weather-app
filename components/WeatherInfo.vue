<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-200">
    <!-- Location and Time -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ weather.location.name }}, {{ weather.location.country }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400" v-if="weather.location.localtime">
        {{ formatTime(weather.location.localtime) }}
        <span class="text-xs text-gray-500">({{ weather.location.localtime }})</span>
      </p>
      <p class="text-gray-600 dark:text-gray-400" v-else>
        {{ $t('weather.timeNotAvailable') }}
      </p>
    </div>

    <!-- Current Weather -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Temperature and Condition -->
      <div class="flex items-center space-x-4">
        <WeatherIcon 
          :condition="weather.current.condition.text"
          size="lg"
          :animated="true"
        />
        <div>
          <p class="text-5xl font-bold text-gray-900 dark:text-white">
            {{ temperature }}{{ temperatureUnit }}
          </p>
          <p class="text-xl text-gray-600 dark:text-gray-400">
            {{ t(`weather.conditions.${normalizeCondition(weather.current.condition.text)}`) }}
          </p>
        </div>
      </div>

      <!-- Additional Weather Info -->
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center space-x-2">
          <i class="fas fa-wind text-blue-500"></i>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ $t('weather.wind') }}</p>
            <p class="text-lg font-medium text-gray-900 dark:text-white">
              {{ windSpeed }} {{ windSpeedUnit }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <i class="fas fa-tint text-blue-500"></i>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ $t('weather.humidity') }}</p>
            <p class="text-lg font-medium text-gray-900 dark:text-white">
              {{ weather.current.humidity }}%
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <i class="fas fa-temperature-high text-orange-500"></i>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ $t('weather.feelsLike') }}</p>
            <p class="text-lg font-medium text-gray-900 dark:text-white">
              {{ useMetric ? weather.current.feelslike_c : weather.current.feelslike_f }}{{ temperatureUnit }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <i class="fas fa-compress-alt text-purple-500"></i>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ $t('weather.pressure') }}</p>
            <p class="text-lg font-medium text-gray-900 dark:text-white">
              {{ useMetric ? weather.current.pressure_mb : weather.current.pressure_in }}
              {{ useMetric ? 'mb' : 'in' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- UV Index and Visibility -->
    <div class="mt-6 grid grid-cols-2 gap-4">
      <div class="flex items-center space-x-2">
        <i class="fas fa-sun text-yellow-500"></i>
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-300">{{ $t('weather.uvIndex') }}</p>
          <p class="text-lg font-medium" :class="getUVIndexClass(weather.current.uv)">
            {{ getUVIndexLevel(weather.current.uv) }}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <i class="fas fa-eye text-gray-500"></i>
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-300">{{ $t('weather.visibility') }}</p>
          <p class="text-lg font-medium text-gray-900 dark:text-white">
            {{ useMetric ? weather.current.vis_km : weather.current.vis_miles }}
            {{ useMetric ? 'km' : 'mi' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WeatherData } from '~/types/weather'
import { useI18n } from 'vue-i18n'
import WeatherIcon from './WeatherIcon.vue'

const { t } = useI18n()

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

const props = defineProps<{
  weather: WeatherData
  temperature: number | null
  temperatureUnit: string
  windSpeed: number | null
  windSpeedUnit: string
  useMetric: boolean
}>()

// Add logging for props
console.log('WeatherInfo props:', {
  hasWeather: !!props.weather,
  location: props.weather?.location,
  hasLocaltime: !!props.weather?.location?.localtime,
  localtimeValue: props.weather?.location?.localtime,
  temperature: props.temperature,
  windSpeed: props.windSpeed
})

const formatTime = (time: string) => {
  if (!time) {
    console.warn('formatTime: Empty time string received')
    return ''
  }
  
  try {
    console.log('formatTime: Received time string:', time, 'Type:', typeof time)
    
    // Check if the time is in 12-hour format (HH:MM AM/PM)
    if (time.includes('AM') || time.includes('PM')) {
      console.log('formatTime: Processing 12-hour format')
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
      
      const result = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      console.log('formatTime: Converted 12-hour to 24-hour:', result)
      return result
    }
    
    // Handle 24-hour format (YYYY-MM-DD HH:MM)
    console.log('formatTime: Processing 24-hour format')
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
    
    const result = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    console.log('formatTime: Formatted 24-hour time:', result)
    return result
  } catch (error) {
    console.error('formatTime: Error formatting time:', error, 'Input:', time)
    return ''
  }
}

const getUVIndexLevel = (uv: number) => {
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  if (uv <= 10) return 'Very High'
  return 'Extreme'
}

const getUVIndexClass = (uv: number) => {
  if (uv <= 2) return 'text-green-500'
  if (uv <= 5) return 'text-yellow-500'
  if (uv <= 7) return 'text-orange-500'
  if (uv <= 10) return 'text-red-500'
  return 'text-purple-500'
}
</script>

<i18n lang="json">
{
  "en": {
    "weather": {
      "wind": "Wind",
      "humidity": "Humidity",
      "feelsLike": "Feels Like",
      "pressure": "Pressure",
      "uvIndex": "UV Index",
      "visibility": "Visibility"
    }
  },
  "de": {
    "weather": {
      "wind": "Wind",
      "humidity": "Luftfeuchtigkeit",
      "feelsLike": "Gefühlt",
      "pressure": "Luftdruck",
      "uvIndex": "UV-Index",
      "visibility": "Sichtweite"
    }
  },
  "fr": {
    "weather": {
      "wind": "Vent",
      "humidity": "Humidité",
      "feelsLike": "Ressenti",
      "pressure": "Pression",
      "uvIndex": "Indice UV",
      "visibility": "Visibilité"
    }
  },
  "it": {
    "weather": {
      "wind": "Vento",
      "humidity": "Umidità",
      "feelsLike": "Percepita",
      "pressure": "Pressione",
      "uvIndex": "Indice UV",
      "visibility": "Visibilità"
    }
  },
  "es": {
    "weather": {
      "wind": "Viento",
      "humidity": "Humedad",
      "feelsLike": "Sensación",
      "pressure": "Presión",
      "uvIndex": "Índice UV",
      "visibility": "Visibilidad"
    }
  },
  "ru": {
    "weather": {
      "wind": "Ветер",
      "humidity": "Влажность",
      "feelsLike": "Ощущается",
      "pressure": "Давление",
      "uvIndex": "УФ-индекс",
      "visibility": "Видимость"
    }
  },
  "pl": {
    "weather": {
      "wind": "Wiatr",
      "humidity": "Wilgotność",
      "feelsLike": "Odczuwalna",
      "pressure": "Ciśnienie",
      "uvIndex": "Indeks UV",
      "visibility": "Widoczność"
    }
  },
  "uk": {
    "weather": {
      "wind": "Вітер",
      "humidity": "Вологість",
      "feelsLike": "Відчувається",
      "pressure": "Тиск",
      "uvIndex": "УФ-індекс",
      "visibility": "Видимість"
    }
  },
  "nl": {
    "weather": {
      "wind": "Wind",
      "humidity": "Luchtvochtigheid",
      "feelsLike": "Voelt als",
      "pressure": "Luchtdruk",
      "uvIndex": "UV-index",
      "visibility": "Zichtbaarheid"
    }
  },
  "tr": {
    "weather": {
      "wind": "Rüzgar",
      "humidity": "Nem",
      "feelsLike": "Hissedilen",
      "pressure": "Basınç",
      "uvIndex": "UV İndeksi",
      "visibility": "Görüş"
    }
  }
}
</i18n> 