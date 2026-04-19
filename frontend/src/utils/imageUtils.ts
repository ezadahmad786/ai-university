/**
 * Utility functions for image processing in chat messages
 */

/**
 * Extract image URLs from text using regex
 * Handles both direct URLs and markdown image syntax
 */
export const extractImageUrls = (text: string): string[] => {
  // Regex to match direct image URLs
  const urlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/gi;
  
  // Regex to match markdown image syntax ![alt](url)
  const markdownRegex = /!\[.*?\]\((https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))\)/gi;
  
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
      const urlMatch = match.match(/\((https?:\/\/.*?)\)/);
      if (urlMatch && urlMatch[1]) {
        urls.push(urlMatch[1]);
      }
    });
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
    // If URL is invalid, return empty string
    return '';
  }
};

/**
 * Check if a URL is an image
 */
export const isImageUrl = (url: string): boolean => {
  return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url);
};
