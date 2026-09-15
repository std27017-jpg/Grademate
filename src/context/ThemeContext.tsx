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
} from '../utils/themeUtils';
import { ThemePatternId } from '../utils/themePatterns';

interface ThemeContextType {
  themeColor: string;
  themePattern: ThemePatternId;
  setThemeColor: (color: string) => void;
  setThemePattern: (pattern: ThemePatternId) => void;
  resetThemeColor: () => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (isOpen: boolean) => void;
  openThemeModal: () => void;
  closeThemeModal: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColorState] = useState<string>(() => getSavedThemeColor());
  const [themePattern, setThemePatternState] = useState<ThemePatternId>(() => getSavedThemePattern());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Apply on mount and when color or pattern changes
  useEffect(() => {
    applyThemeColorToDOM(themeColor, themePattern);
    saveThemeColor(themeColor);
    saveThemePattern(themePattern);
  }, [themeColor, themePattern]);

  const setThemeColor = (newColor: string) => {
    if (hexToRgb(newColor)) {
      setThemeColorState(newColor);
    }
  };

  const setThemePattern = (pattern: ThemePatternId) => {
    setThemePatternState(pattern);
  };

  const resetThemeColor = () => {
    setThemeColorState(DEFAULT_THEME_COLOR);
    setThemePatternState(DEFAULT_THEME_PATTERN);
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
