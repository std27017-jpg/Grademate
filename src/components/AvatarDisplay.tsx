import React, { useState, useEffect } from 'react';
import { Camera, User } from 'lucide-react';
import { getBlobFromIndexedDB } from '../utils/fileStorage';

interface AvatarDisplayProps {
  avatar?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  shape?: 'rounded' | 'circle' | 'inherit';
  className?: string;
  style?: React.CSSProperties;
  editable?: boolean;
  onEdit?: () => void;
  alt?: string;
  fallbackEmoji?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  avatarUrl,
  size = 'md',
  shape = 'inherit',
  className = '',
  style,
  editable = false,
  onEdit,
  alt = 'Avatar',
  fallbackEmoji = '🌸',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [idbObjectUrl, setIdbObjectUrl] = useState<string | null>(null);

  // Active avatar source: prefer avatarUrl if present, otherwise avatar
  const activeSource = avatarUrl || avatar || '';

  // Determine if it's an image URL or an emoji
  const isImageUrl =
    Boolean(activeSource) &&
    typeof activeSource === 'string' &&
    (activeSource.startsWith('/uploads/') ||
      activeSource.startsWith('/api/storage/') ||
      activeSource.startsWith('http://') ||
      activeSource.startsWith('https://') ||
      activeSource.startsWith('blob:') ||
      activeSource.startsWith('data:image'));

  // Reset error & loading state whenever source changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    if (idbObjectUrl) {
      URL.revokeObjectURL(idbObjectUrl);
      setIdbObjectUrl(null);
    }
  }, [activeSource]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (idbObjectUrl) {
        URL.revokeObjectURL(idbObjectUrl);
      }
    };
  }, [idbObjectUrl]);

  // Handle image load error: attempt IndexedDB fallback before giving up
  const handleImageError = async () => {
    if (activeSource && !idbObjectUrl) {
      try {
        const cachedBlob = await getBlobFromIndexedDB(activeSource);
        if (cachedBlob) {
          const tempUrl = URL.createObjectURL(cachedBlob);
          setIdbObjectUrl(tempUrl);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not retrieve fallback blob from IndexedDB:', err);
      }
    }
    setHasError(true);
    setIsLoading(false);
  };

  const currentDisplaySrc = idbObjectUrl || activeSource;

  const sizeStyles: Record<string, string> = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
    xl: 'w-16 h-16 text-3xl',
    '2xl': 'w-20 h-20 text-4xl',
    full: 'w-full h-full text-2xl sm:text-3xl',
  };

  const shapeClass =
    shape === 'circle'
      ? 'rounded-full'
      : shape === 'rounded'
      ? 'rounded-2xl'
      : '[border-radius:inherit]';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editable && onEdit && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onEdit();
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden transition-transform select-none ${shapeClass} ${
        isImageUrl && !hasError
          ? 'bg-transparent'
          : 'bg-gradient-to-br from-pink-100/60 via-white/50 to-purple-100/40 text-slate-800'
      } ${size === 'full' || className.includes('w-full') ? '' : sizeStyles[size] || ''} ${className}`}
      style={{
        borderRadius: shape === 'circle' ? '50%' : 'inherit',
        overflow: 'hidden',
        ...style,
      }}
      onClick={editable && onEdit ? onEdit : undefined}
      onKeyDown={handleKeyDown}
      role={editable && onEdit ? 'button' : undefined}
      tabIndex={editable && onEdit ? 0 : undefined}
      title={editable ? 'แตะเพื่อเปลี่ยนรูปโปรไฟล์' : undefined}
    >
      {isImageUrl && !hasError ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-pink-100/40 backdrop-blur-xs animate-pulse flex items-center justify-center [border-radius:inherit]">
              <span className="text-xs text-pink-400">🌸</span>
            </div>
          )}
          <img
            src={currentDisplaySrc}
            alt={alt}
            className={`w-full h-full object-cover select-none transition-opacity duration-200 block ${shapeClass} ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 'inherit',
            }}
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoading(false)}
            onError={handleImageError}
          />
        </>
      ) : hasError ? (
        <div className="flex items-center justify-center w-full h-full bg-pink-100/80 text-pink-700 [border-radius:inherit]">
          <User className="w-1/2 h-1/2 drop-shadow-2xs text-pink-600" />
        </div>
      ) : (
        <span className="select-none leading-none flex items-center justify-center w-full h-full [border-radius:inherit]">
          {activeSource || fallbackEmoji}
        </span>
      )}

      {editable && (
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer [border-radius:inherit]">
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-md" />
        </div>
      )}
    </div>
  );
};

