<script setup lang="ts">
import { computed, ref } from 'vue'
import { toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import type { WeatherAlert } from '@/types/weather'

const props = defineProps<{
  alerts: WeatherAlert[]
}>()

const { t, locale } = useI18n()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// Convert alerts to raw objects when processing
const rawAlerts = computed(() => props.alerts.map(alert => toRaw(alert)))

type AlertSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor'

const getAlertSeverity = (severity: string) => {
  const severities: Record<AlertSeverity, {
    color: string
    bg: string
    border: string
    icon: string
  }> = {
    'Extreme': {
      color: 'text-red-500 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
    'Severe': {
      color: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
    'Moderate': {
      color: 'text-yellow-500 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    'Minor': {
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  }
  return severities[severity as AlertSeverity] || severities['Minor']
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const expandedAlerts = ref<Set<string>>(new Set())

const toggleAlert = (alertId: string) => {
  if (expandedAlerts.value.has(alertId)) {
    expandedAlerts.value.delete(alertId)
  } else {
    expandedAlerts.value.add(alertId)
  }
}

const getAlertId = (alert: WeatherAlert) => {
  return `${alert.event}-${alert.effective}`
}
</script>

<template>
  <div v-if="rawAlerts && rawAlerts.length > 0" class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
      {{ t('weather.alerts.title') }}
    </h3>
    
    <div class="space-y-3">
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-for="alert in rawAlerts"
          :key="getAlertId(alert)"
          class="rounded-lg border p-4 transform transition-all duration-300 hover:shadow-md"
          :class="[
            getAlertSeverity(alert.severity).bg,
            getAlertSeverity(alert.severity).border
          ]"
        >
          <div
            class="flex items-start justify-between cursor-pointer"
            @click="toggleAlert(getAlertId(alert))"
          >
            <div class="flex items-start space-x-3">
              <svg
                class="w-6 h-6 mt-0.5"
                :class="getAlertSeverity(alert.severity).color"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="getAlertSeverity(alert.severity).icon"
                />
              </svg>
              <div>
                <h4 class="font-medium" :class="getAlertSeverity(alert.severity).color">
                  {{ alert.headline }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {{ formatDate(alert.effective) }} - {{ formatDate(alert.expires) }}
                </p>
              </div>
            </div>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              :aria-label="expandedAlerts.has(getAlertId(alert)) ? t('weather.alerts.collapse') : t('weather.alerts.expand')"
            >
              <svg
                class="w-5 h-5 transform transition-transform duration-200"
                :class="{ 'rotate-180': expandedAlerts.has(getAlertId(alert)) }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          <div
            v-show="expandedAlerts.has(getAlertId(alert))"
            class="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300"
          >
            <p>{{ alert.desc }}</p>
            <p v-if="alert.instruction" class="font-medium">
              {{ t('weather.alerts.instruction') }}: {{ alert.instruction }}
            </p>
            <div class="grid grid-cols-2 gap-4 mt-4 text-xs">
              <div>
                <p class="font-medium text-gray-700 dark:text-gray-300">
                  {{ t('weather.alerts.areas') }}
                </p>
                <p>{{ alert.areas }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-700 dark:text-gray-300">
                  {{ t('weather.alerts.certainty') }}
                </p>
                <p>{{ alert.certainty }}</p>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from,
.alert-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 