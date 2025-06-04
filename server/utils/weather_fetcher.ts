import type { WeatherData, WeatherForecast } from '@/types/weather'

export class WeatherFetcher {
  private apiKey: string
  private baseUrl = 'https://api.weatherapi.com/v1'

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Weather API key is required')
    }
    this.apiKey = apiKey
  }

  private async fetchWithErrorHandling(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || `Weather API error: ${response.statusText}`)
        } else {
          throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
        }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format: Expected JSON')
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Invalid API key')
        }
        if (error.message.includes('No matching location')) {
          throw new Error('City not found')
        }
        throw error
      }
      throw new Error('Failed to fetch weather data')
    }
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    if (!city) {
      throw new Error('City parameter is required')
    }

    const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(city)}&aqi=yes&alerts=yes`
    return this.fetchWithErrorHandling(url)
  }

  async getForecast(city: string, days: number): Promise<WeatherForecast> {
    if (!city) {
      throw new Error('City parameter is required')
    }
    if (days < 1 || days > 3) {
      throw new Error('Days parameter must be between 1 and 3')
    }

    const url = `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(city)}&days=${days}&aqi=yes&alerts=yes`
    const data = await this.fetchWithErrorHandling(url)
    
    // Log the forecast data for debugging
    console.log('Forecast data received:', {
      city,
      days,
      forecastDays: data.forecast?.forecastday?.length || 0,
      firstDay: data.forecast?.forecastday?.[0]?.date,
      lastDay: data.forecast?.forecastday?.[data.forecast?.forecastday?.length - 1]?.date
    })

    return data
  }
} 