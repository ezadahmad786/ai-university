// Configuration for production deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export const CORS_ORIGINS = import.meta.env.VITE_API_URL 
  ? [import.meta.env.VITE_API_URL, 'https://ganaie-ai-university.vercel.app']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];
