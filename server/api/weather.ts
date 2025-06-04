// @ts-ignore
import { WeatherFetcher } from '../utils/weather_fetcher'
import type { WeatherData, WeatherForecast } from '@/types/weather'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const city = query.city as string

  if (!city) {
    throw createError({
      statusCode: 400,
      message: 'City parameter is required'
    })
  }

  try {
    const config = useRuntimeConfig()
    const weatherApiKey = config.weatherApiKey

    if (!weatherApiKey) {
      throw createError({
        statusCode: 500,
        message: 'Weather API key is not configured'
      })
    }

    const weatherFetcher = new WeatherFetcher(weatherApiKey)
    
    // Get both current weather and forecast with 3 days of data
    const [currentWeather, forecastData] = await Promise.all([
      weatherFetcher.getCurrentWeather(city),
      weatherFetcher.getForecast(city, 3)
    ])

    // Log raw API responses for debugging
    console.log('Raw Current Weather Response:', {
      location: currentWeather.location,
      current: currentWeather.current,
      hasLocaltime: !!currentWeather.location?.localtime,
      localtimeValue: currentWeather.location?.localtime
    })

    // Ensure we have valid data before sending response
    if (!currentWeather || !forecastData) {
      throw new Error('Invalid response from weather API')
    }

    // Structure the response to match the expected format
    const response = {
      current: {
        location: {
          ...currentWeather.location,
          localtime: currentWeather.location.localtime || new Date().toISOString().replace('T', ' ').slice(0, 16)
        },
        current: currentWeather.current,
        alerts: currentWeather.alerts || null
      },
      forecast: forecastData.forecast || { forecastday: [] }
    }

    // Log processed response for debugging
    console.log('Processed Weather Response:', {
      location: response.current.location,
      hasLocaltime: !!response.current.location.localtime,
      localtimeValue: response.current.location.localtime,
      localtimeFormat: response.current.location.localtime?.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/) ? 'valid' : 'invalid'
    })

    // Validate the response structure
    if (!response.current.location || !response.current.current) {
      throw new Error('Invalid weather data structure')
    }

    // Ensure localtime is in the correct format (YYYY-MM-DD HH:MM)
    if (!response.current.location.localtime || !response.current.location.localtime.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)) {
      response.current.location.localtime = new Date().toISOString().replace('T', ' ').slice(0, 16)
    }

    // Log the response for debugging
    console.log('Weather API Response:', {
      location: response.current.location.name,
      current: {
        temp: response.current.current.temp_c,
        condition: response.current.current.condition.text
      },
      forecastDays: response.forecast.forecastday?.length || 0
    })

    return response
  } catch (error) {
    console.error('Weather API error:', error)
    
    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw createError({
          statusCode: 401,
          message: 'Invalid API key'
        })
      }
      if (error.message.includes('No matching location')) {
        throw createError({
          statusCode: 404,
          message: 'City not found'
        })
      }
      throw createError({
        statusCode: 500,
        message: `Weather API error: ${error.message}`
      })
    }
    
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred while fetching weather data'
    })
  }
}) 