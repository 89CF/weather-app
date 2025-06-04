from functools import wraps
from flask import request, jsonify
import redis
import json
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Redis client
redis_client = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))

def cache(expire_minutes: int = 30):
    """Caching decorator"""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Generate cache key from request parameters
            cache_key = f"cache:{request.path}:{request.query_string.decode()}"
            
            # Try to get cached response
            cached_response = redis_client.get(cache_key)
            if cached_response:
                return jsonify(json.loads(cached_response))
            
            # Get fresh response
            response = f(*args, **kwargs)
            
            # Cache the response
            if isinstance(response, tuple):
                response_data, status_code = response
                if status_code == 200:  # Only cache successful responses
                    redis_client.setex(
                        cache_key,
                        expire_minutes * 60,
                        json.dumps(response_data.get_json())
                    )
            else:
                if response.status_code == 200:  # Only cache successful responses
                    redis_client.setex(
                        cache_key,
                        expire_minutes * 60,
                        json.dumps(response.get_json())
                    )
            
            return response
        return wrapped
    return decorator 