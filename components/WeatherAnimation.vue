<template>
  <div class="weather-animation-container" :class="containerClass">
    <!-- Lottie animasyonları için -->
    <div v-if="!useParticles" 
         ref="animationContainer" 
         class="w-full h-full flex items-center justify-center">
      <!-- Fallback SVG for when Lottie is loading -->
      <svg v-if="!isLoaded" 
           class="w-16 h-16 text-gray-400 animate-pulse" 
           viewBox="0 0 24 24" 
           fill="none" 
           xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>

    <!-- Three.js parçacık efektleri için -->
    <WeatherParticles
      v-else
      :weather-type="particleWeatherType"
      :intensity="particleIntensity"
      :size="props.size"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import lottie, { type AnimationItem, type AnimationEventName } from 'lottie-web'
import WeatherParticles from './WeatherParticles.vue'

// Define our own type for the animation config
interface LottieAnimationConfig {
  container: HTMLElement
  renderer: 'svg' | 'canvas' | 'html'
  loop: boolean
  autoplay: boolean
  path?: string
  animationData?: any
}

// Define animation size interface
interface AnimationSize {
  width: number
  height: number
}

const props = defineProps<{
  weatherType: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm' | 'windy'
  temperature: number
  size?: 'sm' | 'md' | 'lg'
  class?: string
}>()

const animationContainer = ref<HTMLElement | null>(null)
const animation = ref<AnimationItem | null>(null)
const isLoaded = ref(false)
const isLoading = ref(false)
const errorCount = ref(0)
const MAX_RETRIES = 2

// Initialize debounceTimer as null
let debounceTimer: NodeJS.Timeout | null = null

// Global animation cache - static olarak tanımla
const animationCache = new Map<string, {
  animationData: any,
  lastUsed: number
}>()

// Cache temizleme zamanı (5 dakika)
const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000
let cacheCleanupTimer: NodeJS.Timeout | null = null

// Cache'i temizle
const cleanupCache = () => {
  const now = Date.now()
  for (const [key, value] of animationCache.entries()) {
    if (now - value.lastUsed > CACHE_CLEANUP_INTERVAL) {
      animationCache.delete(key)
    }
  }
}

// Map weather types to Lottie animation paths
const animationMap: Record<string, string> = {
  'sunny': '/animations/sunny.json',
  'cloudy': '/animations/cloudy.json',
  'rain': '/animations/rainy.json',
  'snow': '/animations/snowy.json',
  'thunderstorm': '/animations/thunderstorm.json',
  'windy': '/animations/misty.json'
}

const containerClass = computed(() => ({
  'w-12 h-12': props.size === 'sm',
  'w-16 h-16': props.size === 'md' || !props.size,
  'w-24 h-24': props.size === 'lg',
  ...(props.class ? { [props.class]: true } : {})
}))

const loadAnimation = async () => {
  if (!animationContainer.value || isLoading.value) {
    console.debug('Animation container not ready or already loading:', {
      container: !!animationContainer.value,
      isLoading: isLoading.value,
      containerSize: animationContainer.value ? {
        width: animationContainer.value.offsetWidth,
        height: animationContainer.value.offsetHeight
      } : null
    })
    return
  }

  // Clean up previous animation
  if (animation.value) {
    console.debug('Cleaning up previous animation')
    animation.value.destroy()
    animation.value = null
  }

  isLoaded.value = false
  isLoading.value = true

  const animationPath = animationMap[props.weatherType] || '/animations/sunny.json'
  console.debug('Loading animation:', {
    weatherType: props.weatherType,
    path: animationPath,
    size: props.size,
    container: {
      width: animationContainer.value.offsetWidth,
      height: animationContainer.value.offsetHeight
    }
  })
  
  try {
    // First verify the animation file exists and is accessible
    console.debug('Checking animation file:', animationPath)
    const response = await fetch(animationPath)
    if (!response.ok) {
      throw new Error(`Failed to fetch animation file: ${response.status} ${response.statusText}`)
    }

    // Get the animation data
    const animationData = await response.json()
    console.debug('Animation data loaded successfully:', {
      path: animationPath,
      dataSize: JSON.stringify(animationData).length,
      hasAssets: !!animationData.assets,
      hasLayers: !!animationData.layers,
      version: animationData.v,
      frameRate: animationData.fr,
      totalFrames: animationData.op
    })

    // Load the animation
    if (animationContainer.value) {
      console.debug('Creating new animation instance')
      try {
        // Clear any existing content
        animationContainer.value.innerHTML = ''
        
        animation.value = lottie.loadAnimation({
          container: animationContainer.value,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData,
          rendererSettings: {
            progressiveLoad: true,
            preserveAspectRatio: 'xMidYMid meet'
          }
        })

        // Handle animation load
        animation.value.addEventListener('DOMLoaded', () => {
          const svgElement = animationContainer.value?.querySelector('svg')
          console.debug('New animation loaded successfully', {
            path: animationPath,
            containerSize: {
              width: animationContainer.value?.offsetWidth,
              height: animationContainer.value?.offsetHeight
            },
            svgSize: svgElement ? {
              width: svgElement.getBoundingClientRect().width,
              height: svgElement.getBoundingClientRect().height
            } : null,
            viewBox: svgElement?.getAttribute('viewBox')
          })
          isLoaded.value = true
          isLoading.value = false
          errorCount.value = 0
        })

        // Handle animation errors
        animation.value.addEventListener('error', (err: any) => {
          console.error('Animation error:', {
            type: err.type,
            message: err.message,
            weatherType: props.weatherType,
            attempt: errorCount.value,
            container: {
              width: animationContainer.value?.offsetWidth,
              height: animationContainer.value?.offsetHeight
            }
          })
          
          errorCount.value++
          if (errorCount.value > MAX_RETRIES) {
            console.error('Animation failed after retries:', props.weatherType)
            isLoaded.value = false
            isLoading.value = false
          }
        })

        // Add frame update listener
        animation.value.addEventListener('enterFrame', (ev: any) => {
          if (ev.currentFrame % 30 === 0) { // Log every second (30 frames)
            console.debug('Animation frame:', {
              frame: ev.currentFrame,
              totalFrames: ev.totalFrames,
              progress: (ev.currentFrame / ev.totalFrames * 100).toFixed(1) + '%'
            })
          }
        })

      } catch (err) {
        console.error('Failed to create animation instance:', {
          error: err,
          weatherType: props.weatherType,
          container: {
            width: animationContainer.value?.offsetWidth,
            height: animationContainer.value?.offsetHeight
          }
        })
        throw err
      }
    }
  } catch (err) {
    console.error('Failed to load animation:', {
      error: err,
      weatherType: props.weatherType,
      attempt: errorCount.value,
      path: animationPath
    })
    
    errorCount.value++
    if (errorCount.value <= MAX_RETRIES) {
      // Retry loading after a short delay
      setTimeout(() => {
        if (errorCount.value <= MAX_RETRIES) {
          console.debug('Retrying animation load')
          loadAnimation()
        }
      }, 1000 * errorCount.value)
    } else {
      console.error('Animation failed after retries:', props.weatherType)
      isLoaded.value = false
      isLoading.value = false
    }
  }
}

// Watch for both weatherType and size changes
watch([() => props.weatherType, () => props.size], ([newType, newSize], [oldType, oldSize]) => {
  if (newType === oldType && newSize === oldSize) return
  
  console.debug('Weather animation props changed:', {
    weatherType: { old: oldType, new: newType },
    size: { old: oldSize, new: newSize }
  })
  
  // Clear any existing debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  
  // Immediately start loading the new animation
  errorCount.value = 0
  loadAnimation()
}, { immediate: true })

// Parçacık efektleri için hesaplanmış değerler
const useParticles = computed(() => {
  return ['rain', 'snow', 'mist'].includes(props.weatherType)
})

const particleWeatherType = computed(() => {
  switch (props.weatherType) {
    case 'rain': return 'rain'
    case 'snow': return 'snow'
    case 'windy': return 'mist'
    default: return 'rain'
  }
})

const particleIntensity = computed(() => {
  // Sıcaklığa göre yoğunluk hesapla
  if (props.weatherType === 'rain') {
    return Math.min(1, Math.max(0.3, (props.temperature - 10) / 20))
  } else if (props.weatherType === 'snow') {
    return Math.min(1, Math.max(0.3, (0 - props.temperature) / 10))
  } else {
    return 0.5 // Sis için sabit yoğunluk
  }
})

// Watch for weather type changes
watch(() => props.weatherType, (newType) => {
  if (useParticles.value) {
    // Parçacık efektleri için Lottie animasyonunu temizle
    if (animation.value) {
      animation.value.destroy()
      animation.value = null
    }
    isLoaded.value = true
    isLoading.value = false
  } else {
    // Lottie animasyonu için normal yükleme
    loadAnimation()
  }
}, { immediate: true })

// Load animation on mount
onMounted(() => {
  // Start cache cleanup timer
  cacheCleanupTimer = setInterval(cleanupCache, CACHE_CLEANUP_INTERVAL)
  
  // Ensure animation is loaded
  if (!isLoaded.value && !isLoading.value) {
    loadAnimation()
  }
})

// Clean up on unmount
onUnmounted(() => {
  if (animation.value) {
    animation.value.destroy()
    animation.value = null
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  if (cacheCleanupTimer) {
    clearInterval(cacheCleanupTimer)
  }
  // Clear the cache when component is unmounted
  animationCache.clear()
})
</script>

<style scoped>
.weather-animation-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.weather-animation {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateZ(0);
}
</style> 