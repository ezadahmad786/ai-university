// Configuration for production deployment
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ganaie-ai-university.onrender.com'
  : 'http://127.0.0.1:5000';

export const CORS_ORIGINS = process.env.NODE_ENV === 'production'
  ? ['https://ganaie-ai-university.vercel.app', 'https://ganaie-ai-university.onrender.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];
