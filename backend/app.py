from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
import os
import logging
import requests
import json
import bcrypt
import datetime
import sqlite3
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Tokens don't expire for demo
jwt = JWTManager(app)

# Database setup
def init_db():
    """Initialize SQLite database with users and quiz_results tables"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()
    
    # Initialize quiz_results database
    conn_quiz = sqlite3.connect('quiz_results.db')
    cursor_quiz = conn_quiz.cursor()
    
    # Create quiz_results table
    cursor_quiz.execute('''
        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            subject TEXT NOT NULL,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            date TEXT NOT NULL
        )
    ''')
    
    conn_quiz.commit()
    conn_quiz.close()
    logger.info("Databases initialized successfully")

def get_db_connection():
    """Get database connection"""
    return sqlite3.connect('users.db')

init_db()

# Configure CORS to allow requests from frontend (development and production)
cors_origins = [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://ganaie-ai-university.vercel.app'
]
CORS(app, origins=cors_origins)

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
PRIMARY_MODEL = "openchat/openchat-7b"
FALLBACK_MODELS = [
    "meta-llama/llama-3-8b-instruct",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo"
]

# Structured, teacher-like system prompts
SUBJECT_PROMPTS = {
    'mathematics': """You are a Mathematics teacher. Follow this EXACT format for every answer:

1. **Brief Answer** (1-2 sentences)
2. **Step-by-Step Solution** (numbered steps)
3. **Formula** (use LaTeX format: $formula$ for inline, $$formula$$ for display)
4. **Example** (quick numerical example with LaTeX)
5. **Key Points** (2-3 bullet points)

IMPORTANT: Always use LaTeX for mathematical formulas:
- Inline: $x^2 + y^2 = z^2$
- Display: $$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$
- Fractions: $$\frac{a}{b}$$
- Square roots: $$\sqrt{x}$$
- Exponents: $x^n$
- Greek letters: $\alpha$, $\beta$, $\pi$

Keep answers precise and mathematical. Avoid storytelling.""",

    'physics': """You are a Physics teacher. Follow this EXACT format for every answer:

1. **Concept** (1 sentence definition)
2. **Formula** (use LaTeX format: $formula$ for inline, $$formula$$ for display)
3. **Real-World Example** (daily life application)
4. **Step-by-Step** (if solving a problem)
5. **Key Takeaway** (1 sentence)

IMPORTANT: Always use LaTeX for physics formulas:
- Force: $F = ma$
- Energy: $E = mc^2$
- Gravity: $$F = G\frac{m_1 m_2}{r^2}$$
- Velocity: $v = \frac{d}{t}$
- Acceleration: $a = \frac{\Delta v}{\Delta t}$

Focus on practical applications. Be concise.""",

    'chemistry': """You are a Chemistry teacher. Follow this EXACT format for every answer:

1. **Answer** (direct response)
2. **Chemical Equation** (use LaTeX for subscripts: $H_2O$, $CO_2$)
3. **Explanation** (2-3 sentences)
4. **Example** (specific chemical example)
5. **Safety Note** (if relevant)

IMPORTANT: Use LaTeX for chemical formulas:
- Water: $H_2O$
- Carbon dioxide: $CO_2$
- Sodium chloride: $NaCl$
- Glucose: $C_6H_{12}O_6$
- Equilibrium: $K_{eq}$
- pH: $pH = -\log[H^+]$

Keep explanations simple and chemical-focused.""",

    'biology': """You are a Biology teacher. Follow this EXACT format for every answer:

1. **Answer** (direct response)
2. **Process** (step-by-step biological process)
3. **Example** (specific biological example)
4. **Key Terms** (2-3 important terms)
5. **Summary** (1 sentence)

Use simple language. Avoid unnecessary details.""",

    'programming': """You are a Programming teacher. Follow this EXACT format for every answer:

1. **Solution** (direct answer)
2. **Code Example** (clean, commented code)
3. **Explanation** (line-by-line if needed)
4. **Best Practice** (1 programming tip)
5. **Alternative** (another approach, if applicable)

Keep code clean and well-commented.""",

    'computer science': """You are a Computer Science teacher. Follow this EXACT format for every answer:

1. **Definition** (1 sentence)
2. **How It Works** (2-3 sentences)
3. **Example** (practical example)
4. **Application** (real-world use)
5. **Key Concept** (1 important takeaway)

Focus on algorithms and data structures. Be technical but clear.""",

    'english': """You are an English teacher. Follow this EXACT format for every answer:

1. **Correction** (improved version)
2. **Explanation** (why it's better)
3. **Rule** (grammar/writing rule)
4. **Example** (another example)
5. **Tip** (writing advice)

Be constructive and helpful with language skills.""",

    'arts & humanities': """You are an Arts & Humanities teacher. Follow this EXACT format for every answer:

1. **Answer** (direct response)
2. **Context** (historical/cultural background)
3. **Key Points** (2-3 bullet points)
4. **Significance** (why it matters)
5. **Connection** (modern relevance)

Make connections to today's world. Keep it engaging.""",

    'general': """You are a helpful teacher. Follow this EXACT format for every answer:

1. **Answer** (direct response)
2. **Explanation** (2-3 sentences)
3. **Example** (quick example)
4. **Key Points** (2-3 bullet points)
5. **Summary** (1 sentence)

Be clear, concise, and helpful."""
}

def get_system_prompt(subject: str, mode: str = 'simple') -> str:
    """Get the appropriate system prompt based on subject and mode"""
    subject_lower = subject.lower()
    mode_lower = mode.lower()
    
    # Map common variations
    subject_mapping = {
        'math': 'mathematics',
        'maths': 'mathematics',
        'physics': 'physics',
        'chem': 'chemistry',
        'bio': 'biology',
        'programming': 'programming',
        'coding': 'programming',
        'computer science': 'computer science',
        'cs': 'computer science',
        'english': 'english',
        'arts': 'arts & humanities',
        'humanities': 'arts & humanities',
        'history': 'arts & humanities',
        'general': 'general',
        'default': 'general'
    }
    
    mapped_subject = subject_mapping.get(subject_lower, 'general')
    base_prompt = SUBJECT_PROMPTS.get(mapped_subject, SUBJECT_PROMPTS['general'])
    
    # Add mode-specific instructions
    if mode_lower == 'simple':
        mode_instruction = "\n\nMODE: SIMPLE - Keep answers very brief. Focus on the main points. Use shorter sentences."
    elif mode_lower == 'detailed':
        mode_instruction = "\n\nMODE: DETAILED - Provide comprehensive explanations. Include additional context and examples."
    else:
        mode_instruction = "\n\nMODE: SIMPLE - Keep answers clear and concise."
    
    # Add response length control
    length_control = """
    
RESPONSE GUIDELINES:
- Maximum 150 words for simple mode
- Maximum 300 words for detailed mode
- Use clear formatting with numbered lists and bullet points
- Avoid unnecessary storytelling
- Focus on educational value"""
    
    return f"{base_prompt}{mode_instruction}{length_control}\n\nCurrent subject: {subject.title()}\nResponse mode: {mode.title()}"

# Authentication Routes
@app.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    logger.info("=== REGISTER ENDPOINT CALLED ===")
    
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.json
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        logger.info(f"Registration attempt - Email: {email}")
        
        # Validation
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        
        if '@' not in email or '.' not in email:
            return jsonify({"error": "Invalid email format"}), 400
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "User with this email already exists"}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insert new user
        cursor.execute(
            'INSERT INTO users (email, password, created_at) VALUES (?, ?, ?)',
            (email, hashed_password, str(datetime.datetime.now()))
        )
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"User registered successfully: {email}")
        
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "email": email
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"error": "Registration failed"}), 500

@app.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    logger.info("=== LOGIN ENDPOINT CALLED ===")
    
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.json
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        logger.info(f"Login attempt - Email: {email}")
        
        # Validation
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Find user
        cursor.execute('SELECT id, email, password FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Verify password
        stored_password = user[2]
        if not bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
            conn.close()
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Create access token
        access_token = create_access_token(identity=email)
        
        conn.close()
        
        logger.info(f"User logged in successfully: {email}")
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user[0],
                "email": user[1]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"error": "Login failed"}), 500

@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    """Get user profile (protected route)"""
    logger.info("=== PROFILE ENDPOINT CALLED ===")
    
    try:
        current_email = get_jwt_identity()
        
        if current_email not in users:
            return jsonify({"error": "User not found"}), 404
        
        user = users[current_email]
        
        # Remove password from response
        user_data = {
            "id": user['id'],
            "username": user['username'],
            "email": user['email'],
            "created_at": user['created_at']
        }
        
        logger.info(f"Profile retrieved for: {current_email}")
        
        return jsonify({
            "user": user_data
        }), 200
        
    except Exception as e:
        logger.error(f"Profile error: {e}")
        return jsonify({"error": "Failed to get profile"}), 500

@app.route('/save-quiz', methods=['POST'])
@jwt_required()
def save_quiz():
    """Save quiz result for logged-in user"""
    logger.info("=== SAVE QUIZ ENDPOINT CALLED ===")
    
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
            
        current_email = get_jwt_identity()
        data = request.json
        
        # Validation
        required_fields = ['subject', 'score', 'total_questions']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        subject = data['subject']
        score = data['score']
        total_questions = data['total_questions']
        
        if not isinstance(score, int) or not isinstance(total_questions, int):
            return jsonify({"error": "Score and total_questions must be integers"}), 400
        
        # Save to database
        conn = sqlite3.connect('quiz_results.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO quiz_results (user_id, subject, score, total_questions, date)
            VALUES (?, ?, ?, ?, ?)
        ''', (current_email, subject, score, total_questions, datetime.datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Quiz result saved for {current_email}: {score}/{total_questions} in {subject}")
        
        return jsonify({
            "message": "Quiz result saved successfully",
            "result": {
                "subject": subject,
                "score": score,
                "total_questions": total_questions,
                "percentage": round((score / total_questions) * 100, 1)
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Save quiz error: {e}")
        return jsonify({"error": "Failed to save quiz result"}), 500

@app.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get quiz history for logged-in user"""
    logger.info("=== HISTORY ENDPOINT CALLED ===")
    
    try:
        current_email = get_jwt_identity()
        
        # Get from database
        conn = sqlite3.connect('quiz_results.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, subject, score, total_questions, date
            FROM quiz_results
            WHERE user_id = ?
            ORDER BY date DESC
        ''', (current_email,))
        
        results = cursor.fetchall()
        conn.close()
        
        # Format results
        history = []
        for result in results:
            history.append({
                "id": result[0],
                "subject": result[1],
                "score": result[2],
                "total_questions": result[3],
                "percentage": round((result[2] / result[3]) * 100, 1),
                "date": result[4]
            })
        
        logger.info(f"Retrieved {len(history)} quiz results for {current_email}")
        
        return jsonify({
            "history": history,
            "total_attempts": len(history)
        }), 200
        
    except Exception as e:
        logger.error(f"History error: {e}")
        return jsonify({"error": "Failed to get quiz history"}), 500

@app.route('/')
def home():
    return jsonify({"message": "Ganaie AI University Backend API - OpenRouter Version"})

@app.route('/test', methods=['GET', 'POST'])
def test():
    """Simple test endpoint to verify backend is working"""
    logger.info("=== TEST ENDPOINT CALLED ===")
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else {}
        logger.info(f"Test POST data: {data}")
        return jsonify({
            "message": "POST test successful",
            "received_data": data,
            "timestamp": datetime.datetime.now().isoformat()
        })
    else:
        return jsonify({
            "message": "Backend is running correctly",
            "timestamp": datetime.datetime.now().isoformat(),
            "cors_enabled": True,
            "available_endpoints": ["/login", "/register", "/profile", "/quiz", "/save-quiz", "/history", "/test"]
        })

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
        subject = data.get('subject', 'General')
        mode = data.get('mode', 'simple')  # Default to simple mode
        
        logger.info(f"=== NEW REQUEST ===")
        logger.info(f"Message: '{message}'")
        logger.info(f"Subject: '{subject}'")
        logger.info(f"Mode: '{mode}'")
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
        
        # Get dynamic system prompt based on subject and mode
        system_prompt = get_system_prompt(subject, mode)
        logger.info(f"Generated system prompt for {subject} in {mode} mode")
        
        # Adjust max_tokens based on mode
        max_tokens = 150 if mode.lower() == 'simple' else 300
        
        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": max_tokens,
            "temperature": 0.3  # Lower temperature for more consistent responses
        }
        
        logger.info(f"Request payload - Max tokens: {max_tokens}, Temperature: 0.3")
        
        # Try primary model first, then fallbacks
        models_to_try = [PRIMARY_MODEL] + FALLBACK_MODELS
        
        for model_name in models_to_try:
            logger.info(f"Trying model: {model_name}")
            payload["model"] = model_name
            
            logger.info(f"Sending request to: {OPENROUTER_URL}")
            logger.info(f"Request payload: {payload}")
            
            # Send request to OpenRouter
            try:
                response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=30)
                
                logger.info(f"Response status code: {response.status_code}")
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
                                word_count = len(ai_reply.split())
                                char_count = len(ai_reply)
                                
                                logger.info(f"=== SUCCESS RESPONSE ===")
                                logger.info(f"Model: {model_name}")
                                logger.info(f"Subject: {subject}")
                                logger.info(f"Mode: {mode}")
                                logger.info(f"Word count: {word_count}")
                                logger.info(f"Character count: {char_count}")
                                logger.info(f"Response preview: {ai_reply[:150]}...")
                                
                                # Validate response length
                                if mode.lower() == 'simple' and word_count > 150:
                                    logger.warning(f"Simple mode response too long: {word_count} words")
                                elif mode.lower() == 'detailed' and word_count > 300:
                                    logger.warning(f"Detailed mode response too long: {word_count} words")
                                
                                # Return response in required format
                                return jsonify({
                                    "reply": ai_reply,
                                    "metadata": {
                                        "subject": subject,
                                        "mode": mode,
                                        "word_count": word_count,
                                        "model": model_name
                                    }
                                })
                            else:
                                logger.error("Message or content not found in choice")
                                continue  # Try next model
                        else:
                            logger.error("No choices found in response")
                            continue  # Try next model
                    except ValueError as e:
                        logger.error(f"JSON parsing error: {e}")
                        continue  # Try next model
                elif response.status_code == 404:
                    logger.error(f"Model not found: {model_name} - trying next model")
                    continue  # Try next model
                elif response.status_code == 401:
                    logger.error("Authentication failed - invalid API key")
                    return jsonify({
                        "error": "Invalid API key"
                    }), 401
                elif response.status_code == 429:
                    logger.error("Rate limit exceeded")
                    return jsonify({
                        "reply": "AI rate limit exceeded. Please try again in a moment."
                    }), 429
                elif response.status_code == 400:
                    logger.error("Bad request - invalid parameters")
                    return jsonify({
                        "reply": "Invalid request format to AI service."
                    }), 400
                else:
                    logger.error(f"HTTP Error {response.status_code}: {response.text}")
                    continue  # Try next model
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"Request to OpenRouter failed for {model_name}: {e}")
                continue  # Try next model
        
        # If all models failed
        logger.error("All models failed")
        return jsonify({
            "reply": "AI service is temporarily unavailable. Please try again later."
        })
            
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        return jsonify({
            "error": "An unexpected error occurred. Please try again."
        }), 500

@app.route('/quiz', methods=['POST'])
def generate_quiz():
    """Generate quiz questions based on subject, topic, and difficulty"""
    logger.info("=== QUIZ ENDPOINT CALLED ===")
    
    try:
        # Get JSON data from request
        if not request.is_json:
            logger.error("Request is not JSON")
            return jsonify({
                "error": "Request must be JSON"
            }), 400
            
        data = request.json
        subject = data.get('subject', 'General')
        topic = data.get('topic', 'General Knowledge')
        difficulty = data.get('difficulty', 'easy')
        num_questions = data.get('num_questions', 5)
        
        logger.info(f"Quiz request - Subject: {subject}, Topic: {topic}, Difficulty: {difficulty}")
        
        # Check if API key is configured
        if not api_key:
            logger.error("OpenRouter API key is missing")
            return jsonify({
                "error": "API key missing"
            }), 500
        
        # Create quiz generation prompt
        quiz_prompt = f"""You are an expert {subject} teacher. Generate {num_questions} multiple-choice questions about {topic} at {difficulty} difficulty level.

IMPORTANT: Return ONLY valid JSON in this exact format:
{{
  "quiz": [
    {{
      "question": "Clear question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "A",
      "explanation": "Clear, student-friendly explanation of why this answer is correct"
    }},
    {{
      "question": "Second question here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "B",
      "explanation": "Simple explanation that helps students understand the concept"
    }}
  ]
}}

Requirements:
- Questions must be clear and unambiguous
- Only one correct answer per question
- Options should be plausible but clearly distinguishable
- Include a simple, educational explanation for each question
- Explanations should be student-friendly and help with learning
- Difficulty: {difficulty} (easy: basic concepts, medium: intermediate, hard: advanced)
- Topic: {topic}
- Subject: {subject}

Generate exactly {num_questions} questions with explanations. Return ONLY the JSON, no explanations."""

        # Prepare request to OpenRouter
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Ganaie AI University Quiz Generator"
        }
        
        payload = {
            "messages": [
                {"role": "system", "content": "You are an expert quiz generator. Always return valid JSON format only."},
                {"role": "user", "content": quiz_prompt}
            ],
            "max_tokens": 1000,
            "temperature": 0.3  # Lower temperature for consistent output
        }
        
        logger.info(f"Generating quiz with {num_questions} questions for {subject}")
        
        # Try primary model first, then fallbacks
        models_to_try = [PRIMARY_MODEL] + FALLBACK_MODELS
        
        for model_name in models_to_try:
            logger.info(f"Trying model: {model_name}")
            payload["model"] = model_name
            
            try:
                response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=30)
                
                if response.status_code == 200:
                    try:
                        response_data = response.json()
                        
                        if 'choices' in response_data and len(response_data['choices']) > 0:
                            ai_reply = response_data['choices'][0]['message']['content'].strip()
                            logger.info(f"Quiz generated successfully with {model_name}")
                            
                            # Try to parse JSON response
                            try:
                                quiz_data = json.loads(ai_reply)
                                
                                # Validate quiz structure
                                if 'quiz' in quiz_data and isinstance(quiz_data['quiz'], list):
                                    questions = quiz_data['quiz']
                                    valid_questions = []
                                    
                                    for i, q in enumerate(questions):
                                        if (isinstance(q, dict) and 
                                            'question' in q and 
                                            'options' in q and 
                                            'answer' in q and
                                            'explanation' in q and
                                            isinstance(q['options'], list) and
                                            len(q['options']) == 4):
                                            
                                            valid_questions.append(q)
                                        else:
                                            logger.warning(f"Invalid question format at index {i}")
                                    
                                    logger.info(f"Successfully validated {len(valid_questions)} questions")
                                    
                                    return jsonify({
                                        "quiz": valid_questions,
                                        "subject": subject,
                                        "topic": topic,
                                        "difficulty": difficulty,
                                        "total_questions": len(valid_questions)
                                    })
                                else:
                                    logger.error("Invalid quiz structure in response")
                                    
                            except json.JSONDecodeError as e:
                                logger.error(f"Failed to parse JSON response: {e}")
                                # Try to extract JSON from response
                                import re
                                json_match = re.search(r'\{.*\}', ai_reply, re.DOTALL)
                                if json_match:
                                    try:
                                        quiz_data = json.loads(json_match.group())
                                        if 'quiz' in quiz_data:
                                            return jsonify({
                                                "quiz": quiz_data['quiz'],
                                                "subject": subject,
                                                "topic": topic,
                                                "difficulty": difficulty,
                                                "total_questions": len(quiz_data['quiz'])
                                            })
                                    except:
                                        pass
                                
                                logger.error("Could not extract valid JSON from response")
                                
                    except ValueError as e:
                        logger.error(f"JSON parsing error: {e}")
                        continue  # Try next model
                        
                elif response.status_code == 404:
                    logger.error(f"Model not found: {model_name} - trying next model")
                    continue
                elif response.status_code == 401:
                    logger.error("Authentication failed - invalid API key")
                    return jsonify({
                        "error": "Invalid API key"
                    }), 401
                else:
                    logger.error(f"HTTP Error {response.status_code}: {response.text}")
                    continue
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"Request to OpenRouter failed for {model_name}: {e}")
                continue
        
        # If all models failed
        logger.error("All models failed for quiz generation")
        return jsonify({
            "error": "Quiz generation failed. Please try again."
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in quiz endpoint: {e}")
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
        "primary_model": PRIMARY_MODEL,
        "fallback_models": FALLBACK_MODELS,
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
            "model": PRIMARY_MODEL,
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
    logger.info(f"Primary Model: {PRIMARY_MODEL}")
    logger.info(f"Fallback Models: {FALLBACK_MODELS}")
    
    # Use dynamic port for production (Render sets PORT environment variable)
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
