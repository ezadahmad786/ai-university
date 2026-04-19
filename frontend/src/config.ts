// Configuration for production deployment
const API_URL = import.meta.env.VITE_API_URL;
console.log("API URL:", API_URL);

export const API_BASE_URL = API_URL || 'http://127.0.0.1:5000';

export const CORS_ORIGINS = API_URL 
  ? [API_URL, 'https://ganaie-ai-university.vercel.app']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];
