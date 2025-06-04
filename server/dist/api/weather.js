import express from 'express';
import { WeatherFetcher } from '../utils/weather_fetcher.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) {
            return res.status(400).json({ error: 'City parameter is required' });
        }
        const weatherApiKey = process.env.WEATHER_API_KEY;
        if (!weatherApiKey) {
            return res.status(500).json({ error: 'Weather API key is not configured' });
        }
        const weatherFetcher = new WeatherFetcher(weatherApiKey);
        const weatherData = await weatherFetcher.fetchWeather(city);
        const forecastData = await weatherFetcher.fetchForecast(city);
        console.log('Raw API Response:', weatherData);
        console.log('Processed Response:', {
            location: weatherData.location,
            current: weatherData.current,
            forecast: forecastData.forecast
        });
        // Validate response structure
        if (!weatherData.location || !weatherData.current || !forecastData.forecast) {
            throw new Error('Invalid API response structure');
        }
        res.json({
            location: weatherData.location,
            current: weatherData.current,
            forecast: forecastData.forecast
        });
    }
    catch (error) {
        console.error('Weather API Error:', error);
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                res.status(401).json({ error: 'Invalid API key' });
            }
            else if (error.message.includes('city not found')) {
                res.status(404).json({ error: 'City not found' });
            }
            else {
                res.status(500).json({ error: 'Failed to fetch weather data' });
            }
        }
        else {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});
export { router as weatherRouter };
