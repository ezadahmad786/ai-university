import os
import logging
import sqlite3
import bcrypt
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # For demo purposes
jwt = JWTManager(app)

# Configure CORS for production
app.config['CORS_ORIGINS'] = [
    'https://ganaie-ai-university.vercel.app',
    'https://ganaie-ai-university.onrender.com'
]
CORS(app, origins=app.config['CORS_ORIGINS'])

# Database setup
DATABASE_FILE = 'users.db'

def init_db():
    """Initialize SQLite database with users table"""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Create users table if it doesn't exist
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
    logger.info("Database initialized successfully")

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# Routes
@app.route('/')
def home():
    return jsonify({
        "message": "Ganaie AI University Authentication API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": ["/signup", "/login", "/profile", "/health"]
    })

@app.route('/health')
def health():
    """Health check endpoint for Render monitoring"""
    return jsonify({
        "status": "healthy",
        "database": "connected",
        "timestamp": os.times()[0]
    })

@app.route('/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    logger.info("=== SIGNUP ENDPOINT CALLED ===")
    
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validation
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "Email already registered"}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insert new user
        cursor.execute(
            'INSERT INTO users (email, password, created_at) VALUES (?, ?, ?)',
            (email, hashed_password, os.times()[0])
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
        logger.error(f"Signup error: {e}")
        return jsonify({"error": "Registration failed"}), 500

@app.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    logger.info("=== LOGIN ENDPOINT CALLED ===")
    
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
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
        stored_password = user['password']
        if not bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
            conn.close()
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Generate JWT token
        access_token = create_access_token(identity=email)
        
        conn.close()
        
        logger.info(f"User logged in successfully: {email}")
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user['id'],
                "email": user['email']
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
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user info
        cursor.execute('SELECT id, email, created_at FROM users WHERE email = ?', (current_email,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({"error": "User not found"}), 404
        
        conn.close()
        
        return jsonify({
            "user": {
                "id": user['id'],
                "email": user['email'],
                "created_at": user['created_at']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Profile error: {e}")
        return jsonify({"error": "Failed to get profile"}), 500

if __name__ == '__main__':
    # Initialize database on startup
    init_db()
    
    logger.info("=== STARTING GANAI AI UNIVERSITY PRODUCTION API ===")
    logger.info(f"JWT Secret Key: {'CONFIGURED' if os.getenv('JWT_SECRET_KEY') else 'MISSING'}")
    logger.info(f"Database file: {DATABASE_FILE}")
    
    # Get port from environment variable (Render sets this)
    port = int(os.environ.get('PORT', 5000))
    
    logger.info(f"Starting Flask server on port {port}")
    app.run(debug=False, host='0.0.0.0', port=port)
