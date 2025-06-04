<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      @keydown.enter="isOpen = !isOpen"
      @keydown.space.prevent="isOpen = !isOpen"
      class="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      :aria-label="t('app.language.switch')"
      :aria-expanded="isOpen"
      role="combobox"
      aria-haspopup="listbox"
    >
      <span class="text-sm font-medium">{{ currentLocale.name }}</span>
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Language Dropdown -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
      role="listbox"
      aria-label="Select language"
    >
      <div class="py-1 max-h-[300px] overflow-y-auto" role="none">
        <button
          v-for="locale in availableLocales"
          :key="locale.code"
          @click="switchLanguage(locale.code)"
          @keydown="(e) => handleKeyDown(e, locale.code)"
          class="w-full text-left px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
          :class="{ 'bg-gray-50 dark:bg-gray-700': locale.code === currentLocale.code }"
          role="option"
          :aria-selected="locale.code === currentLocale.code"
          tabindex="0"
        >
          {{ locale.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const isOpen = shallowRef(false)

// Define available locales statically
const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'ru', name: 'Русский' },
  { code: 'pl', name: 'Polski' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'uk', name: 'Українська' },
  { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'pt', name: 'Português' },
  { code: 'sv', name: 'Svenska' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'he', name: 'עברית' },
  { code: 'hu', name: 'Magyar' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'cs', name: 'Čeština' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'fi', name: 'Suomi' },
  { code: 'da', name: 'Dansk' },
  { code: 'uk', name: 'Українська' }
] as const

// Memoize the available locales
const availableLocales = computed(() => {
  const translations = new Map(LOCALES.map(l => [l.code, t(`app.language.${l.code}`)]))
  return LOCALES.map(l => ({
    code: l.code,
    name: translations.get(l.code) || l.name
  }))
})

const currentLocale = computed(() => {
  return availableLocales.value.find(l => l.code === locale.value) || availableLocales.value[0]
})

// Debounce the language switch
let switchTimeout: NodeJS.Timeout | null = null
const switchLanguage = async (code: string) => {
  if (switchTimeout) {
    clearTimeout(switchTimeout)
  }

  try {
    // Önce locale'i güncelle
    locale.value = code
    
    // Mevcut route'u al
    const currentRoute = route.fullPath
    
    // Yeni route'u oluştur
    const newRoute = currentRoute.replace(/^\/[a-z]{2}(?=\/|$)/, `/${code}`)
    
    // Nuxt router ile yönlendir
    await router.push(newRoute)
  } catch (error) {
    console.error('Language switch failed:', error)
    // Hata durumunda ana sayfaya yönlendir
    await router.push(`/${code}`)
  } finally {
    isOpen.value = false
  }
}

// Add keyboard navigation support
const handleKeyDown = (event: KeyboardEvent, code: string) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    switchLanguage(code)
  }
}

// Optimize click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    requestAnimationFrame(() => {
      isOpen.value = false
    })
  }
}

// Use passive event listener for better scroll performance
onMounted(() => {
  document.addEventListener('click', handleClickOutside, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 