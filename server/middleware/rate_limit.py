from functools import wraps
from flask import request, jsonify, current_app, make_response
import time
from datetime import datetime, timedelta
import redis
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Redis client
redis_client = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))

def rate_limit(requests_per_minute: int):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Get client IP
            client_ip = request.remote_addr
            
            # Create Redis key for this IP
            key = f"rate_limit:{client_ip}"
            
            # Get current timestamp
            now = datetime.utcnow()
            
            # Get existing requests from Redis
            pipe = redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, (now - timedelta(minutes=1)).timestamp())
            pipe.zcard(key)
            pipe.zadd(key, {str(now.timestamp()): now.timestamp()})
            pipe.expire(key, 60)
            _, request_count, _, _ = pipe.execute()
            
            # Check if rate limit exceeded
            if request_count >= requests_per_minute:
                return jsonify({
                    "error": "Rate limit exceeded",
                    "retry_after": 60
                }), 429
            
            # Get the response from the wrapped function
            response = f(*args, **kwargs)
            
            # Ensure the response is a Flask Response object
            if isinstance(response, tuple):
                response = make_response(response)
            
            # Add rate limit headers
            response.headers['X-RateLimit-Limit'] = str(requests_per_minute)
            response.headers['X-RateLimit-Remaining'] = str(requests_per_minute - request_count - 1)
            response.headers['X-RateLimit-Reset'] = str(int((now + timedelta(minutes=1)).timestamp()))
            
            return response
        return wrapped
    return decorator 