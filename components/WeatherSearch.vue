<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, markRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const emit = defineEmits<{
  (e: 'search', city: string): void
  (e: 'location-search'): void
}>()

// Reactive variables
const city = shallowRef('')
const isSearching = shallowRef(false)
const isLocationSearching = shallowRef(false)
const showDropdown = shallowRef(false)
const inputRef = ref<HTMLInputElement>()

interface CitySuggestion {
  name: string
  country: string
  lat: number
  lon: number
  display_name: string
}

const suggestions = shallowRef<CitySuggestion[]>([])
const selectedIndex = shallowRef(-1)
const searchTimeout = shallowRef<NodeJS.Timeout | null>(null)

// Static icons
const icons = markRaw({
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  loading: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
  dropdown: 'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
})

// Şehir önerilerini getir
const fetchCitySuggestions = async (query: string) => {
  try {
    const normalizedQuery = query.trim()
    
    // URL'den dil kodunu al (örn: /de -> de, /tr -> tr)
    const currentLang = route.path.split('/')[1] || 'en'
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&` +
      `q=${encodeURIComponent(normalizedQuery)}&` +
      `limit=10&` +
      `addressdetails=1&` +
      `accept-language=${currentLang}&` +
      `countrycodes=tr,us,gb,de,fr,es,it,nl,be,ch,at,se,no,dk,fi,pl,cz,hu,ro,bg,hr,si,sk,lt,lv,ee,ie,pt,gr,cy,mt`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WeatherApp/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Benzersiz şehirler için Set kullan
    const uniqueCities = new Set<string>()
    
    suggestions.value = data
      .map((item: any) => {
        // Şehir ismini al
        const name = item.address?.city || 
                    item.address?.town || 
                    item.address?.village || 
                    item.display_name?.split(',')[0]?.trim() || 
                    item.name || ''
        
        // Ülke ismini al
        const country = item.address?.country || ''
        
        if (!name || !country) return null
        
        return {
          name: name.trim(),
          country: country.trim(),
          lat: parseFloat(item.lat) || 0,
          lon: parseFloat(item.lon) || 0,
          display_name: item.display_name || `${name}, ${country}`
        }
      })
      .filter((item: CitySuggestion | null): item is CitySuggestion => {
        if (!item || !item.name) return false
        
        const key = `${item.name.toLowerCase()}-${item.country.toLowerCase()}`
        if (uniqueCities.has(key)) return false
        
        uniqueCities.add(key)
        return true
      })
      .slice(0, 8) // En fazla 8 öneri göster
      
  } catch (error) {
    console.error('Şehir önerileri getirilirken hata:', error)
    suggestions.value = []
  }
}

// Debounced search
const debouncedFetch = (query: string) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    fetchCitySuggestions(query)
  }, 300)
}

// Input değişikliklerini izle
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  city.value = target.value
  selectedIndex.value = -1
  
  if (city.value.trim().length >= 2) {
    showDropdown.value = true
    debouncedFetch(city.value)
  } else {
    showDropdown.value = false
    suggestions.value = []
  }
}

// Arama işlemi
const handleSearch = async () => {
  if (!city.value.trim() || isSearching.value) return
  
  isSearching.value = true
  showDropdown.value = false
  
  try {
    emit('search', city.value.trim())
    city.value = ''
    suggestions.value = []
  } catch (error) {
    console.error('Arama hatası:', error)
  } finally {
    isSearching.value = false
  }
}

// Konum arama
const handleLocationSearch = async () => {
  if (isLocationSearching.value) return
  
  isLocationSearching.value = true
  showDropdown.value = false
  
  try {
    emit('location-search')
  } catch (error) {
    console.error('Konum arama hatası:', error)
  } finally {
    isLocationSearching.value = false
  }
}

// Öneri seçimi
const handleSuggestionClick = (suggestion: CitySuggestion) => {
  city.value = suggestion.name
  showDropdown.value = false
  suggestions.value = []
  handleSearch()
}

// Klavye navigasyonu
const handleKeyDown = (event: KeyboardEvent) => {
  if (!showDropdown.value || suggestions.value.length === 0) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearch()
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1)
      break
    
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && suggestions.value[selectedIndex.value]) {
        handleSuggestionClick(suggestions.value[selectedIndex.value])
      } else {
        handleSearch()
      }
      break
    
    case 'Escape':
      showDropdown.value = false
      selectedIndex.value = -1
      inputRef.value?.blur()
      break
  }
}

// Input focus
const handleFocus = () => {
  if (city.value.trim().length >= 2 && suggestions.value.length > 0) {
    showDropdown.value = true
  }
}

// Dışarı tıklama
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.search-container')) {
    showDropdown.value = false
    selectedIndex.value = -1
  }
}

// Dropdown toggle
const toggleDropdown = () => {
  if (city.value.trim().length >= 2) {
    showDropdown.value = !showDropdown.value
    if (showDropdown.value) {
      debouncedFetch(city.value)
    }
  } else {
    // Boş input için popüler şehirleri API'den çek
    fetchCitySuggestions('')
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<template>
  <div class="w-full max-w-md mx-auto space-y-4">
    <!-- Ana Arama Formu -->
    <div class="search-container relative">
      <div class="relative">
        <!-- Arama Input -->
        <input
          ref="inputRef"
          :value="city"
          type="text"
          :placeholder="t('weather.search.placeholder')"
          @input="handleInput"
          @keydown="handleKeyDown"
          @focus="handleFocus"
          class="w-full h-12 px-4 pl-12 pr-10 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          :disabled="isSearching || isLocationSearching"
        />
        
        <!-- Arama İkonu -->
        <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.search" />
          </svg>
        </div>

        <!-- Dropdown Toggle -->
        <button
          @click="toggleDropdown"
          type="button"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
          :disabled="isSearching || isLocationSearching"
        >
          <svg class="w-4 h-4 transition-transform duration-200" 
               :class="{ 'rotate-180': showDropdown }" 
               fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" :d="icons.dropdown" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Öneriler Dropdown -->
        <div
          v-if="showDropdown && suggestions.length > 0"
          class="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto"
        >
          <ul class="py-1">
            <li
              v-for="(suggestion, index) in suggestions"
              :key="`${suggestion.name}-${suggestion.country}`"
              @click="handleSuggestionClick(suggestion)"
              class="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
              :class="{ 
                'bg-blue-50 border-blue-100': index === selectedIndex,
                'text-blue-700': index === selectedIndex 
              }"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900">{{ suggestion.name }}</div>
                  <div class="text-sm text-gray-500">{{ suggestion.country }}</div>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Arama ve Konum Butonları -->
      <div class="flex gap-2 mt-3">
        <!-- Arama Butonu -->
        <button
          @click="handleSearch"
          type="button"
          class="flex-1 h-12 flex items-center justify-center gap-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          :disabled="isSearching || isLocationSearching || !city.trim()"
        >
          <svg v-if="isSearching" class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" :d="icons.loading" />
          </svg>
          {{ isSearching ? t('weather.search.searching') : t('weather.search.searchButton') }}
        </button>

        <!-- Konum Butonu -->
        <button
          @click="handleLocationSearch"
          type="button"
          class="h-12 px-4 flex items-center justify-center gap-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          :disabled="isSearching || isLocationSearching"
        >
          <svg v-if="isLocationSearching" class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" :d="icons.loading" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.location" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
s
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Erişilebilirlik için hareket azaltma */
@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation: none;
  }
  
  .transition-all,
  .transition-colors,
  .transition-transform {
    transition: none !important;
  }
}

/* Scroll bar styling */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>