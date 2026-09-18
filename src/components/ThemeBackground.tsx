import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { getPatternSvgDataUri } from '../utils/themePatterns';

interface ThemeBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ children, className = '' }) => {
  const { themeColor, themePattern } = useTheme();
  const patternUri = getPatternSvgDataUri(themePattern, themeColor);

  return (
    <div
      className={`min-h-screen w-full relative overflow-x-hidden flex flex-col font-sans transition-colors duration-500 ${className}`}
      style={{
        background: 'var(--theme-background-gradient, linear-gradient(135deg, var(--app-bg-start, #fdf2f8) 0%, var(--app-bg-mid, #faf5ff) 50%, var(--app-bg-end, #eef2ff) 100%))',
        color: 'var(--theme-text-primary, var(--text-primary, #0f172a))',
      }}
    >
      {/* LAYER 2 & 3: Floating Atmospheric Blurred Glowing Color Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {/* Glowing Blob 1 - Top Left / Center */}
        <div
          className="absolute -top-20 -left-20 w-[26rem] sm:w-[36rem] h-[26rem] sm:h-[36rem] rounded-full filter blur-[70px] sm:blur-[100px] animate-blob-1 blob-mix"
          style={{ backgroundColor: 'var(--app-blob-1, #f472b6)' }}
        />

        {/* Glowing Blob 2 - Top Right / Middle */}
        <div
          className="absolute top-1/4 -right-24 w-[28rem] sm:w-[38rem] h-[28rem] sm:h-[38rem] rounded-full filter blur-[80px] sm:blur-[110px] animate-blob-2 blob-mix"
          style={{ backgroundColor: 'var(--app-blob-2, #c084fc)' }}
        />

        {/* Glowing Blob 3 - Bottom Left / Center */}
        <div
          className="absolute -bottom-28 left-1/3 w-[24rem] sm:w-[32rem] h-[24rem] sm:h-[32rem] rounded-full filter blur-[75px] sm:blur-[95px] animate-blob-3 blob-mix"
          style={{ backgroundColor: 'var(--app-blob-3, var(--theme-primary, #db2777))' }}
        />

        {/* Radial ambient highlight at top */}
        <div
          className="absolute top-0 left-0 right-0 h-96 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* LAYER 4: Pattern Background (Flower, Heart, Star, Cloud, Ribbon, Leaf, etc.) */}
      {themePattern !== 'none' && themePattern !== 'gradient' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
          style={{
            backgroundImage: patternUri,
            backgroundRepeat: 'repeat',
            backgroundSize:
              themePattern === 'polka'
                ? '36px 36px'
                : themePattern === 'sparkles'
                ? '48px 48px'
                : themePattern === 'doodle'
                ? '72px 72px'
                : '60px 60px',
            opacity: 0.24,
          }}
          aria-hidden="true"
        />
      )}

      {/* LAYER 5: Liquid Glass UI Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col w-full">{children}</div>
    </div>
  );
};
