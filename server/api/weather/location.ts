import { WeatherFetcher } from '../../utils/weather_fetcher'
import type { WeatherData, WeatherForecast } from '@/types/weather'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lat = query.lat as string
  const lon = query.lon as string

  if (!lat || !lon) {
    throw createError({
      statusCode: 400,
      message: 'Latitude and longitude parameters are required'
    })
  }

  try {
    const config = useRuntimeConfig()
    const weatherApiKey = config.weatherApiKey as string
    const weatherFetcher = new WeatherFetcher(weatherApiKey)
    
    // Convert lat/lon to a string format that WeatherAPI accepts
    const location = `${lat},${lon}`
    
    // Get both current weather and forecast
    const [currentWeather, forecastData] = await Promise.all([
      weatherFetcher.getCurrentWeather(location),
      weatherFetcher.getForecast(location, 3)
    ])

    // Log raw API responses for debugging
    console.log('Raw Location Weather Response:', {
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
      forecast: {
        forecast: {
          forecastday: forecastData.forecast?.forecastday || []
        }
      }
    }

    // Log processed response for debugging
    console.log('Processed Location Weather Response:', {
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
          message: 'Location not found'
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