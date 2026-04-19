/**
 * Utility functions for image processing in chat messages
 */

/**
 * Extract image URLs from text using regex
 * Handles both direct URLs, markdown image syntax, and Unsplash URLs
 */
export const extractImageUrls = (text: string): string[] => {
  // Regex to match direct image URLs with file extensions
  const urlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/gi;
  
  // Regex to match markdown image syntax with any URL (including Unsplash)
  const markdownRegex = /!\[.*?\]\((https?:\/\/[^)]+)\)/gi;
  
  // Regex to match Unsplash URLs specifically
  const unsplashRegex = /https?:\/\/source\.unsplash\.com\/[^)\s]+/gi;
  
  const urls: string[] = [];
  
  // Extract direct URLs
  const directMatches = text.match(urlRegex);
  if (directMatches) {
    urls.push(...directMatches);
  }
  
  // Extract URLs from markdown syntax
  const markdownMatches = text.match(markdownRegex);
  if (markdownMatches) {
    markdownMatches.forEach(match => {
      // Extract URL from markdown syntax
      const urlMatch = match.match(/\((https?:\/\/[^)]+)\)/);
      if (urlMatch && urlMatch[1]) {
        urls.push(urlMatch[1]);
      }
    });
  }
  
  // Extract Unsplash URLs directly
  const unsplashMatches = text.match(unsplashRegex);
  if (unsplashMatches) {
    urls.push(...unsplashMatches);
  }
  
  // Remove duplicates and return
  return Array.from(new Set(urls));
};

/**
 * Clean text by removing image markdown syntax
 */
export const cleanTextImages = (text: string): string => {
  // Remove markdown image syntax
  return text.replace(/!\[.*?\]\(https?:\/\/.*?\)/gi, '');
};

/**
 * Generate a safe image URL with fallback
 */
export const getSafeImageUrl = (url: string): string => {
  try {
    // Validate URL
    new URL(url);
    return url;
  } catch {
    // If URL is invalid, return fallback image
    return 'https://source.unsplash.com/600x400/?educational-diagram';
  }
};

/**
 * Check if a URL is an image or Unsplash URL
 */
export const isImageUrl = (url: string): boolean => {
  // Check for file extensions
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url)) {
    return true;
  }
  // Check for Unsplash URLs
  if (/source\.unsplash\.com/i.test(url)) {
    return true;
  }
  return false;
};

/**
 * Get fallback image URL based on query
 */
export const getFallbackImageUrl = (query: string = 'educational-diagram'): string => {
  const cleanQuery = query.replace(/\s+/g, '+');
  return `https://source.unsplash.com/600x400/?${cleanQuery}`;
};
