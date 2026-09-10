import React from 'react';
import { Camera } from 'lucide-react';

interface AvatarDisplayProps {
  avatar: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  editable?: boolean;
  onEdit?: () => void;
  alt?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  size = 'md',
  className = '',
  editable = false,
  onEdit,
  alt = 'Avatar',
}) => {
  const isImageUrl =
    Boolean(avatar) &&
    (avatar.startsWith('data:image') ||
      avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('blob:'));

  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
    xl: 'w-16 h-16 text-3xl',
    '2xl': 'w-20 h-20 text-4xl',
  };

  const container = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden transition-transform ${sizeStyles[size]} ${className}`}
      onClick={editable && onEdit ? onEdit : undefined}
      role={editable && onEdit ? 'button' : undefined}
      tabIndex={editable && onEdit ? 0 : undefined}
      title={editable ? 'แตะเพื่อเปลี่ยนรูปโปรไฟล์' : undefined}
    >
      {isImageUrl ? (
        <img
          src={avatar}
          alt={alt}
          className="w-full h-full object-cover rounded-full select-none"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="select-none leading-none flex items-center justify-center w-full h-full">
          {avatar || '🌸'}
        </span>
      )}

      {editable && (
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer rounded-full">
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-md" />
        </div>
      )}
    </div>
  );

  return container;
};
