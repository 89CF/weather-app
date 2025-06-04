import requests
from datetime import datetime
import json
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class WeatherFetcher:
    """Weather data fetcher using the WeatherAPI"""
    
    def __init__(self, api_key: str):
        """Initialize with API key"""
        self.api_key = api_key
        self.base_url = "http://api.weatherapi.com/v1"
    
    def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Make a request to the WeatherAPI"""
        # Add API key to params
        params['key'] = self.api_key
        
        # Make request
        response = requests.get(f"{self.base_url}/{endpoint}", params=params)
        
        # Check for errors
        response.raise_for_status()
        
        # Return JSON response
        return response.json()
    
    def fetch_weather(self, city: str, lang: str = 'en') -> Dict[str, Any]:
        """Fetch current weather for a city"""
        params = {
            'q': city,
            'lang': lang,
            'aqi': 'no'  # Don't include air quality data
        }
        return self._make_request('current.json', params)
    
    def fetch_forecast(self, city: str, lang: str = 'en', days: int = 3) -> Dict[str, Any]:
        """Fetch weather forecast for a city"""
        params = {
            'q': city,
            'lang': lang,
            'days': days,
            'aqi': 'no'
        }
        return self._make_request('forecast.json', params)
    
    def fetch_alerts(self, city: str, lang: str = 'en') -> Dict[str, Any]:
        """Fetch weather alerts for a city"""
        params = {
            'q': city,
            'lang': lang,
            'alerts': 'yes'
        }
        return self._make_request('forecast.json', params) 