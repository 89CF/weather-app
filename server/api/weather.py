from flask import Blueprint, jsonify, request, current_app, make_response
from datetime import datetime
import os
from dotenv import load_dotenv
from ..utils.weather_fetcher import WeatherFetcher
from ..middleware.rate_limit import rate_limit
from ..utils.cache import cache
from functools import wraps

# Load environment variables
load_dotenv()

# Validate required environment variables
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
if not WEATHER_API_KEY:
    raise ValueError("WEATHER_API_KEY environment variable is not set")

# Initialize weather fetcher
weather_fetcher = WeatherFetcher(WEATHER_API_KEY)

# Create blueprint
weather_bp = Blueprint('weather', __name__)

def validate_weather_data(data):
    """Validate weather data structure"""
    required_fields = ['location', 'country', 'current', 'forecast']
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
            
    # Basic validation for forecast structure
    if not isinstance(data.get('forecast'), list) or not data['forecast']:
        raise ValueError("Forecast data is missing or not a list")
        
    return data

def get_location_params():
    """Get location parameters from request"""
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not (city or (lat and lon)):
        return None, None, None
    
    if city:
        return city, None, None
    return None, float(lat), float(lon)

@weather_bp.route('/weather/current')
@rate_limit(requests_per_minute=60)
@cache(expire_minutes=30)
def get_current_weather():
    """
    Get current weather information.
    
    Query Parameters:
    - city: City name to get weather for (optional if lat/lon provided)
    - lat: Latitude (optional if city provided)
    - lon: Longitude (optional if city provided)
    - lang: Language for weather descriptions (default: en)
    
    Returns:
    - JSON: Current weather information
    """
    try:
        city, lat, lon = get_location_params()
        if not (city or (lat and lon)):
            return jsonify({"error": "Either city or lat/lon parameters are required"}), 400
        lang = request.args.get('lang', 'en')
        
        if city:
            weather_data = weather_fetcher.fetch_weather(city, lang=lang)
        else:
            weather_data = weather_fetcher.fetch_weather_by_coords(lat, lon, lang=lang)
            
        return jsonify(weather_data)
    except Exception as e:
        current_app.logger.error(f"Error fetching current weather: {e}")
        return jsonify({"error": "Unable to fetch weather data. Please try again later.", "details": str(e)}), 500

@weather_bp.route('/weather/forecast')
@rate_limit(requests_per_minute=60)
@cache(expire_minutes=30)
def get_forecast():
    """
    Get weather forecast.
    
    Query Parameters:
    - city: City name to get forecast for (optional if lat/lon provided)
    - lat: Latitude (optional if city provided)
    - lon: Longitude (optional if city provided)
    - days: Number of days to forecast (1-3, default: 1)
    - lang: Language for weather descriptions (default: en)
    
    Returns:
    - JSON: Weather forecast information
    """
    try:
        city, lat, lon = get_location_params()
        if not (city or (lat and lon)):
            return jsonify({"error": "Either city or lat/lon parameters are required"}), 400
        days = min(max(int(request.args.get('days', 1)), 1), 3)
        lang = request.args.get('lang', 'en')
        
        if city:
            forecast_data = weather_fetcher.fetch_forecast(city, lang=lang, days=days)
        else:
            forecast_data = weather_fetcher.fetch_forecast_by_coords(lat, lon, lang=lang, days=days)
            
        return jsonify(forecast_data)
    except Exception as e:
        current_app.logger.error(f"Error fetching forecast: {e}")
        return jsonify({"error": "Unable to fetch forecast data. Please try again later.", "details": str(e)}), 500

@weather_bp.route('/weather')
@rate_limit(requests_per_minute=60)
@cache(expire_minutes=30)
def get_weather_combined():
    try:
        city, lat, lon = get_location_params()
        if not (city or (lat and lon)):
            return jsonify({"error": "Either city or lat/lon parameters are required"}), 400
        days = min(max(int(request.args.get('days', 3)), 1), 3)
        lang = request.args.get('lang', 'en')
        
        if city:
            current = weather_fetcher.fetch_weather(city, lang=lang)
            forecast = weather_fetcher.fetch_forecast(city, lang=lang, days=days)
        else:
            current = weather_fetcher.fetch_weather_by_coords(lat, lon, lang=lang)
            forecast = weather_fetcher.fetch_forecast_by_coords(lat, lon, lang=lang, days=days)
            
        return jsonify({"current": current, "forecast": forecast})
    except Exception as e:
        current_app.logger.error(f"Error fetching combined weather: {e}")
        return jsonify({"error": "Unable to fetch weather data. Please try again later.", "details": str(e)}), 500

@weather_bp.route('/health')
def health_check():
    """Health check endpoint"""
    try:
        # Check Redis connection
        redis_client.ping()
        redis_status = "connected"
    except Exception as e:
        redis_status = f"disconnected - {str(e)}"

    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "redis_status": redis_status
    }) 