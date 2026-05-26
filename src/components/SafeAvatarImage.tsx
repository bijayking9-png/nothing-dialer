import React, { useState } from 'react';

interface SafeAvatarImageProps {
  src?: string;
  alt: string;
  fallback: React.ReactNode;
  className?: string;
}

export default function SafeAvatarImage({ src, alt, fallback, className }: SafeAvatarImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      onLoad={() => setIsLoaded(true)}
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}
