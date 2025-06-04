import express from 'express';
import { WeatherFetcher } from '../utils/weather_fetcher';
import type { WeatherData, WeatherForecast } from '../types/weather';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/weather', async (req, res) => {
  const city = req.query.city as string;

  if (!city) {
    return res.status(400).json({
      error: 'City parameter is required'
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
    
    // Get both current weather and forecast with 3 days of data
    const [currentWeather, forecastData] = await Promise.all([
      weatherFetcher.getCurrentWeather(city),
      weatherFetcher.getForecast(city, 3)
    ]);

    // Log raw API responses for debugging
    console.log('Raw Current Weather Response:', {
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
      forecast: forecastData.forecast || { forecastday: [] }
    };

    // Log processed response for debugging
    console.log('Processed Weather Response:', {
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

    // Log the response for debugging
    console.log('Weather API Response:', {
      location: response.current.location.name,
      current: {
        temp: response.current.current.temp_c,
        condition: response.current.current.condition.text
      },
      forecastDays: response.forecast.forecastday?.length || 0
    });

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
          error: 'City not found'
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
