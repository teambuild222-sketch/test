import React, { useState, useEffect } from 'react';
import { PLACEHOLDER_IMAGES } from './placeholderImages';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  fallback?: string;
  containerClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  fallback = PLACEHOLDER_IMAGES.default,
  containerClassName = '',
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setImageSrc(fallback);
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden w-full h-full ${containerClassName}`}>
      {/* Loading skeleton - shimmer effect */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-900/40 via-slate-800/40 to-slate-900/40" />
      )}
      
      {/* Image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />

      {/* Error state - only show if there's a persistent error and we're on the fallback */}
      {hasError && imageSrc === fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/90 to-slate-950/90">
          <div className="text-center px-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="text-slate-400 text-xs">Image unavailable</div>
          </div>
        </div>
      )}
    </div>
  );
};
