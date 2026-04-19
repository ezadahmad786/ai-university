import React, { useState } from 'react';
import { extractImageUrls, getSafeImageUrl } from '../utils/imageUtils';
import './EnhancedImageRenderer.css';

interface ImageData {
  query?: string;
  caption?: string;
  url?: string;
}

interface EnhancedImageRendererProps {
  text: string;
  backendImages?: ImageData[];
}

const EnhancedImageRenderer: React.FC<EnhancedImageRendererProps> = ({ 
  text, 
  backendImages = [] 
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Extract image URLs from text
  const extractedUrls = extractImageUrls(text);
  
  // Combine backend images and extracted URLs
  const allImages = [
    ...backendImages.map(img => ({
      url: `https://source.unsplash.com/600x400/?${img.query}`,
      caption: img.caption || 'Generated Image',
      type: 'backend' as const
    })),
    ...extractedUrls.map((url, index) => ({
      url: getSafeImageUrl(url),
      caption: `Image ${index + 1}`,
      type: 'extracted' as const
    }))
  ].filter(img => img.url); // Filter out invalid URLs

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
  };

  // If no images, return null
  if (allImages.length === 0) {
    return null;
  }

  return (
    <div className="enhanced-image-container">
      {allImages.map((image, index) => (
        <div key={`${image.type}-${index}`} className="enhanced-image-wrapper">
          {!loadedImages.has(index) && !failedImages.has(index) && (
            <div className="enhanced-image-loading">
              <div className="enhanced-image-spinner"></div>
              <span className="enhanced-image-loading-text">
                Loading image...
              </span>
            </div>
          )}
          
          {failedImages.has(index) ? (
            <div className="enhanced-image-error">
              Image failed to load
            </div>
          ) : (
            <img
              src={image.url}
              alt={image.caption}
              className={`enhanced-image ${loadedImages.has(index) ? 'loaded' : 'loading'}`}
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageError(index)}
            />
          )}
          
          {image.caption && loadedImages.has(index) && (
            <p className="enhanced-image-caption">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default EnhancedImageRenderer;
