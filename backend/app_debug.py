from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import requests
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Configure CORS to allow requests from frontend
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

# Initialize OpenRouter API key with detailed debugging
api_key = os.getenv('OPENROUTER_API_KEY')
logger.info(f"Environment variable OPENROUTER_API_KEY exists: {bool(api_key)}")
if api_key:
    logger.info(f"API key starts with: {api_key[:10]}...")
    logger.info(f"API key length: {len(api_key)}")
else:
    logger.error("OPENROUTER_API_KEY not found in environment variables")

# OpenRouter API configuration
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME = "mistralai/mistral-7b-instruct"

# System message for AI teacher
SYSTEM_MESSAGE = "You are a helpful AI teacher. Explain concepts simply with examples."

@app.route('/')
def home():
    return jsonify({"message": "Ganaie AI University Backend API - OpenRouter Version"})

@app.route('/api/subjects')
def get_subjects():
    subjects = [
        {"id": 1, "name": "Physics", "description": "Learn physics concepts"},
        {"id": 2, "name": "Biology", "description": "Explore biology topics"},
        {"id": 3, "name": "Python", "description": "Master Python programming"}
    ]
    return jsonify(subjects)

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests with OpenRouter API integration"""
    logger.info("=== CHAT ENDPOINT CALLED ===")
    
    try:
        # Get JSON data from request
        if not request.is_json:
            logger.error("Request is not JSON")
            return jsonify({
                "error": "Request must be JSON"
            }), 400
            
        data = request.json
        message = data.get('message', '').strip()
        
        logger.info(f"Received message: '{message}'")
        logger.info(f"Message length: {len(message)}")
        
        if not message:
            logger.error("Empty message received")
            return jsonify({
                "error": "Message cannot be empty"
            }), 400
        
        # Check if API key is configured
        if not api_key:
            logger.error("OpenRouter API key is missing")
            return jsonify({
                "error": "API key missing"
            }), 500
        
        # Prepare request to OpenRouter
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Ganaie AI University"
        }
        
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": SYSTEM_MESSAGE},
                {"role": "user", "content": message}
            ],
            "max_tokens": 500,
            "temperature": 0.7
        }
        
        logger.info(f"Sending request to: {OPENROUTER_URL}")
        logger.info(f"Using model: {MODEL_NAME}")
        logger.info(f"Request payload: {payload}")
        
        # Send request to OpenRouter
        try:
            response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=30)
            
            logger.info(f"Response status code: {response.status_code}")
            logger.info(f"Response headers: {dict(response.headers)}")
            logger.info(f"Response text: {response.text[:500]}...")
            
            if response.status_code == 200:
                try:
                    response_data = response.json()
                    logger.info(f"Response JSON keys: {list(response_data.keys())}")
                    
                    # Extract AI response
                    if 'choices' in response_data and len(response_data['choices']) > 0:
                        choice = response_data['choices'][0]
                        logger.info(f"Choice keys: {list(choice.keys())}")
                        
                        if 'message' in choice and 'content' in choice['message']:
                            ai_reply = choice['message']['content'].strip()
                            logger.info(f"AI reply: {ai_reply[:100]}...")
                            
                            # Return response in required format
                            return jsonify({
                                "reply": ai_reply
                            })
                        else:
                            logger.error("Message or content not found in choice")
                            return jsonify({
                                "reply": "AI response format error"
                            })
                    else:
                        logger.error("No choices found in response")
                        return jsonify({
                            "reply": "AI response format error"
                        })
                except ValueError as e:
                    logger.error(f"JSON parsing error: {e}")
                    return jsonify({
                        "reply": "AI response parsing error"
                    })
            else:
                logger.error(f"HTTP Error {response.status_code}: {response.text}")
                
                # Handle specific error codes
                if response.status_code == 401:
                    return jsonify({
                        "error": "Invalid API key"
                    }), 401
                elif response.status_code == 429:
                    return jsonify({
                        "reply": "AI rate limit exceeded. Please try again."
                    }), 429
                elif response.status_code == 400:
                    return jsonify({
                        "reply": "Invalid request format"
                    }), 400
                else:
                    return jsonify({
                        "reply": f"AI service error ({response.status_code})"
                    })
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request to OpenRouter failed: {e}")
            return jsonify({
                "reply": "AI service connection failed"
            })
            
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        return jsonify({
            "error": "An unexpected error occurred. Please try again."
        }), 500

@app.route('/health')
def health_check():
    """Health check endpoint to verify OpenRouter availability"""
    return jsonify({
        "status": "healthy",
        "api_key_present": bool(api_key),
        "api_source": "OpenRouter",
        "model": MODEL_NAME,
        "api_key_preview": f"{api_key[:10]}..." if api_key else None
    })

@app.route('/test-api')
def test_api():
    """Test endpoint to verify OpenRouter API connection"""
    if not api_key:
        return jsonify({
            "error": "API key not configured"
        }), 500
    
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "user", "content": "Hello, this is a test."}
            ],
            "max_tokens": 10
        }
        
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=10)
        
        return jsonify({
            "status_code": response.status_code,
            "response_preview": response.text[:200],
            "success": response.status_code == 200
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("=== STARTING GANAI AI UNIVERSITY BACKEND ===")
    logger.info(f"OpenRouter API Key: {'CONFIGURED' if api_key else 'MISSING'}")
    logger.info(f"Model: {MODEL_NAME}")
    app.run(debug=True, port=5000)
