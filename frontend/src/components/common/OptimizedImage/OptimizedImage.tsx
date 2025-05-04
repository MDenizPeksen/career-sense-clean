import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lowQualitySrc?: string;
  lazyLoad?: boolean;
  blurhash?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  lowQualitySrc,
  lazyLoad = true,
  blurhash,
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string>(lowQualitySrc || '');

  // Handle image loading
  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = () => {
    setError(true);
    if (fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    if (onError) onError();
  };

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || !imgRef.current) return;

    observer.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setCurrentSrc(src);
        if (observer.current) {
          observer.current.disconnect();
        }
      }
    }, {
      rootMargin: '200px', // Load images when they're 200px from viewport
      threshold: 0.01
    });

    observer.current.observe(imgRef.current);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [lazyLoad, src]);

  // If not using lazy loading, load the image immediately
  useEffect(() => {
    if (!lazyLoad) {
      setCurrentSrc(src);
    }
  }, [lazyLoad, src]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: '#f0f0f0' }}>
      {/* Blurhash or low-quality placeholder */}
      {!loaded && blurhash && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${blurhash})`,
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={currentSrc || (lazyLoad ? '' : src)}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
      
      {/* Loading indicator */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-400 text-sm">Image failed to load</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
