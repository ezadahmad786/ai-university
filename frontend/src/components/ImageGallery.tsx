import React, { useState } from 'react';
import './ImageGallery.css';

interface ImageData {
  query: string;
  caption: string;
}

interface ImageGalleryProps {
  images: ImageData[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="image-gallery">
      <div className="images-container">
        {images.map((image, index) => (
          <div key={index} className="image-wrapper">
            <div className="image-container">
              {!loadedImages.has(index) && !failedImages.has(index) && (
                <div className="image-loading">
                  <div className="loading-spinner"></div>
                  <span>Loading image...</span>
                </div>
              )}
              
              {failedImages.has(index) ? (
                <div className="image-error">
                  <span>Failed to load image</span>
                </div>
              ) : (
                <img
                  src={`https://source.unsplash.com/600x400/?${encodeURIComponent(image.query)}`}
                  alt={image.caption}
                  className={`chat-image ${loadedImages.has(index) ? 'loaded' : 'loading'}`}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  style={{ display: loadedImages.has(index) ? 'block' : 'none' }}
                />
              )}
            </div>
            
            <div className="image-caption">
              <span>{image.caption}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
