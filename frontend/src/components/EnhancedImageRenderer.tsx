import React from 'react';
import './EnhancedImageRenderer.css';

interface EnhancedImageRendererProps {
  text: string;
}

const EnhancedImageRenderer: React.FC<EnhancedImageRendererProps> = ({ text }) => {
  // Extract image URLs using regex: /\!\[.*?\]\((.*?)\)/
  const imageRegex = /\!\[.*?\]\((.*?)\)/g;
  const matches = Array.from(text.matchAll(imageRegex));
  
  // If no images found, return null
  if (matches.length === 0) {
    return null;
  }

  // Validate and fix URLs
  const validateAndFixUrl = (url: string): string => {
    // Remove any surrounding whitespace
    const cleanUrl = url.trim();
    
    // Check if URL starts with https:// and is not empty
    if (cleanUrl.startsWith('https://') && cleanUrl.length > 8) {
      return cleanUrl;
    }
    
    // If invalid, replace with fallback
    return 'https://source.unsplash.com/600x400/?education';
  };

  return (
    <div className="enhanced-image-container">
      {matches.map((match, index) => {
        const imageUrl = validateAndFixUrl(match[1]);
        
        return (
          <div key={index} className="enhanced-image-wrapper">
            <img
              src={imageUrl}
              alt="AI Image"
              className="enhanced-image"
              onError={(e) => {
                // Fallback to education image if original fails
                e.target.src = 'https://source.unsplash.com/600x400/?education';
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default EnhancedImageRenderer;
