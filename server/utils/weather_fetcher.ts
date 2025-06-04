import fetch from 'node-fetch';
import type { WeatherData, WeatherForecast } from '../types/weather.js';

export class WeatherFetcher {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.weatherapi.com/v1';
  }

  async fetchWeather(location: string): Promise<WeatherData> {
    const response = await fetch(
      `${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&aqi=no`
    );

    if (!response.ok) {
      const error = await response.json();
      if (error.error?.code === 1006) {
        throw new Error('city not found');
      }
      if (error.error?.code === 2008) {
        throw new Error('API key is invalid');
      }
      throw new Error(`Weather API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data;
  }

  async fetchForecast(location: string): Promise<WeatherForecast> {
    const response = await fetch(
      `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&days=3&aqi=no`
    );

    if (!response.ok) {
      const error = await response.json();
      if (error.error?.code === 1006) {
        throw new Error('city not found');
      }
      if (error.error?.code === 2008) {
        throw new Error('API key is invalid');
      }
      throw new Error(`Weather API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data;
  }
} 