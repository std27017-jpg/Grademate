import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_PATTERN,
  getSavedThemeColor,
  saveThemeColor,
  getSavedThemePattern,
  saveThemePattern,
  applyThemeColorToDOM,
  hexToRgb,
  RANDOM_THEME_COLORS,
} from '../utils/themeUtils';
import { ThemePatternId, THEME_PATTERNS } from '../utils/themePatterns';
import { useGrade } from './GradeContext';

interface ThemeContextType {
  themeColor: string;
  themePattern: ThemePatternId;
  setThemeColor: (color: string) => void;
  setThemePattern: (pattern: ThemePatternId) => void;
  resetThemeColor: () => void;
  randomTheme: () => { color: string; pattern: ThemePatternId };
  randomPattern: () => ThemePatternId;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (isOpen: boolean) => void;
  openThemeModal: () => void;
  closeThemeModal: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userProfile, updateUserProfile } = useGrade();

  // Initialize from userProfile if available, or fallback to saved localStorage / default
  const [themeColor, setThemeColorState] = useState<string>(() => {
    if (userProfile?.themeColor && hexToRgb(userProfile.themeColor)) {
      return userProfile.themeColor;
    }
    return getSavedThemeColor();
  });

  const [themePattern, setThemePatternState] = useState<ThemePatternId>(() => {
    if (userProfile?.themePattern) {
      return userProfile.themePattern as ThemePatternId;
    }
    return getSavedThemePattern();
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Sync when account changes (Login / Switch profile / Logout)
  useEffect(() => {
    if (userProfile) {
      if (userProfile.themeColor && hexToRgb(userProfile.themeColor) && userProfile.themeColor !== themeColor) {
        setThemeColorState(userProfile.themeColor);
      }
      if (userProfile.themePattern && userProfile.themePattern !== themePattern) {
        setThemePatternState(userProfile.themePattern as ThemePatternId);
      }
    }
  }, [userProfile?.id]);

  // Apply on mount and when color or pattern changes, with local storage backup
  useEffect(() => {
    applyThemeColorToDOM(themeColor, themePattern);
    saveThemeColor(themeColor);
    saveThemePattern(themePattern);
  }, [themeColor, themePattern]);

  const setThemeColor = (newColor: string) => {
    if (hexToRgb(newColor)) {
      setThemeColorState(newColor);
      if (userProfile?.id && updateUserProfile) {
        updateUserProfile({ themeColor: newColor });
      }
    }
  };

  const setThemePattern = (pattern: ThemePatternId) => {
    setThemePatternState(pattern);
    if (userProfile?.id && updateUserProfile) {
      updateUserProfile({ themePattern: pattern });
    }
  };

  const resetThemeColor = () => {
    setThemeColorState(DEFAULT_THEME_COLOR);
    setThemePatternState(DEFAULT_THEME_PATTERN);
    if (userProfile?.id && updateUserProfile) {
      updateUserProfile({ themeColor: DEFAULT_THEME_COLOR, themePattern: DEFAULT_THEME_PATTERN });
    }
  };

  const randomTheme = () => {
    const availablePatterns = THEME_PATTERNS.filter((p) => p.id !== 'none' && p.id !== 'gradient');
    const randomPat = availablePatterns[Math.floor(Math.random() * availablePatterns.length)] || THEME_PATTERNS[0];
    const randomCol = RANDOM_THEME_COLORS[Math.floor(Math.random() * RANDOM_THEME_COLORS.length)] || DEFAULT_THEME_COLOR;

    setThemeColorState(randomCol);
    setThemePatternState(randomPat.id);
    if (userProfile?.id && updateUserProfile) {
      updateUserProfile({ themeColor: randomCol, themePattern: randomPat.id });
    }
    return { color: randomCol, pattern: randomPat.id };
  };

  const randomPattern = () => {
    const availablePatterns = THEME_PATTERNS.filter(
      (p) => p.id !== 'none' && p.id !== 'gradient' && p.id !== themePattern
    );
    const randomPat = availablePatterns[Math.floor(Math.random() * availablePatterns.length)] || THEME_PATTERNS[0];

    setThemePatternState(randomPat.id);
    if (userProfile?.id && updateUserProfile) {
      updateUserProfile({ themePattern: randomPat.id });
    }
    return randomPat.id;
  };

  const openThemeModal = () => setIsThemeModalOpen(true);
  const closeThemeModal = () => setIsThemeModalOpen(false);

  return (
    <ThemeContext.Provider
      value={{
        themeColor,
        themePattern,
        setThemeColor,
        setThemePattern,
        resetThemeColor,
        randomTheme,
        randomPattern,
        isThemeModalOpen,
        setIsThemeModalOpen,
        openThemeModal,
        closeThemeModal,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

