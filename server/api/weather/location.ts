import express from 'express';
import { WeatherFetcher } from '../../utils/weather_fetcher';
import type { WeatherData, WeatherForecast } from '../../types/weather';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/location', async (req, res) => {
  const lat = req.query.lat as string;
  const lon = req.query.lon as string;

  if (!lat || !lon) {
    return res.status(400).json({
      error: 'Latitude and longitude parameters are required'
    });
  }

  try {
    const weatherApiKey = process.env.WEATHER_API_KEY;
    
    if (!weatherApiKey) {
      return res.status(500).json({
        error: 'Weather API key is not configured'
      });
    }

    const weatherFetcher = new WeatherFetcher(weatherApiKey);
    
    // Convert lat/lon to a string format that WeatherAPI accepts
    const location = `${lat},${lon}`;
    
    // Get both current weather and forecast
    const [currentWeather, forecastData] = await Promise.all([
      weatherFetcher.getCurrentWeather(location),
      weatherFetcher.getForecast(location, 3)
    ]);

    // Log raw API responses for debugging
    console.log('Raw Location Weather Response:', {
      location: currentWeather.location,
      current: currentWeather.current,
      hasLocaltime: !!currentWeather.location?.localtime,
      localtimeValue: currentWeather.location?.localtime
    });

    // Ensure we have valid data before sending response
    if (!currentWeather || !forecastData) {
      throw new Error('Invalid response from weather API');
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
    };

    // Log processed response for debugging
    console.log('Processed Location Weather Response:', {
      location: response.current.location,
      hasLocaltime: !!response.current.location.localtime,
      localtimeValue: response.current.location.localtime,
      localtimeFormat: response.current.location.localtime?.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/) ? 'valid' : 'invalid'
    });

    // Validate the response structure
    if (!response.current.location || !response.current.current) {
      throw new Error('Invalid weather data structure');
    }

    // Ensure localtime is in the correct format (YYYY-MM-DD HH:MM)
    if (!response.current.location.localtime || !response.current.location.localtime.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)) {
      response.current.location.localtime = new Date().toISOString().replace('T', ' ').slice(0, 16);
    }

    return res.json(response);
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(401).json({
          error: 'Invalid API key'
        });
      }
      if (error.message.includes('No matching location')) {
        return res.status(404).json({
          error: 'Location not found'
        });
      }
      return res.status(500).json({
        error: `Weather API error: ${error.message}`
      });
    }
    
    return res.status(500).json({
      error: 'An unexpected error occurred while fetching weather data'
    });
  }
});

export default router; 
