import { ref, computed } from 'vue'

interface GeolocationState {
  position: GeolocationPosition | null
  error: string | null
  loading: boolean
}

export const useGeolocation = () => {
  const state = ref<GeolocationState>({
    position: null,
    error: null,
    loading: false
  })

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    state.value.loading = true
    state.value.error = null

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by your browser'
        state.value.error = error
        state.value.loading = false
        reject(new Error(error))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          state.value.position = position
          state.value.loading = false
          resolve(position)
        },
        (error) => {
          const errorMessage = error.message || 'Failed to get location'
          state.value.error = errorMessage
          state.value.loading = false
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    })
  }

  return {
    position: computed(() => state.value.position),
    error: computed(() => state.value.error),
    loading: computed(() => state.value.loading),
    getCurrentPosition
  }
} 