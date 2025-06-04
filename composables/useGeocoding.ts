import { ref } from 'vue'

interface GeocodingState {
  city: string | null
  error: string | null
  loading: boolean
}

export const useGeocoding = () => {
  const state = ref<GeocodingState>({
    city: null,
    error: null,
    loading: false
  })

  const getCityFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    state.value.loading = true
    state.value.error = null

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'Accept-Language': navigator.language,
            'User-Agent': 'WeatherApp/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch location data')
      }

      const data = await response.json()
      
      // Extract city name from address components
      const city = data.address.city || 
                  data.address.town || 
                  data.address.village || 
                  data.address.municipality ||
                  data.address.county ||
                  data.address.state

      if (!city) {
        throw new Error('Could not determine city name')
      }

      state.value.city = city
      state.value.loading = false
      return city
    } catch (error) {
      state.value.loading = false
      state.value.error = error instanceof Error ? error.message : 'Failed to get city name'
      throw error
    }
  }

  return {
    state,
    getCityFromCoordinates
  }
} 