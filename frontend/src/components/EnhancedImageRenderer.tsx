import React from 'react';
import { extractImageUrl } from '../utils/imageUtils';
import './EnhancedImageRenderer.css';

interface EnhancedImageRendererProps {
  text: string;
}

const EnhancedImageRenderer: React.FC<EnhancedImageRendererProps> = ({ text }) => {
  // Only render if response exists
  if (!text) {
    return null;
  }

  // Extract image URL safely
  const imageUrl = extractImageUrl(text);
  
  // If no valid image URL, return null
  if (!imageUrl || imageUrl === "https://source.unsplash.com/600x400/?education") {
    return null;
  }

  return (
    <div className="enhanced-image-container">
      <div className="enhanced-image-wrapper">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="AI visual"
            className="enhanced-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://source.unsplash.com/600x400/?science";
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedImageRenderer;
