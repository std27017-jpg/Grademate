import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  DEFAULT_THEME_COLOR,
  getSavedThemeColor,
  saveThemeColor,
  applyThemeColorToDOM,
  hexToRgb,
} from '../utils/themeUtils';

interface ThemeContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
  resetThemeColor: () => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (isOpen: boolean) => void;
  openThemeModal: () => void;
  closeThemeModal: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColorState] = useState<string>(() => getSavedThemeColor());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Apply on mount and when color changes
  useEffect(() => {
    applyThemeColorToDOM(themeColor);
    saveThemeColor(themeColor);
  }, [themeColor]);

  const setThemeColor = (newColor: string) => {
    if (hexToRgb(newColor)) {
      setThemeColorState(newColor);
    }
  };

  const resetThemeColor = () => {
    setThemeColorState(DEFAULT_THEME_COLOR);
  };

  const openThemeModal = () => setIsThemeModalOpen(true);
  const closeThemeModal = () => setIsThemeModalOpen(false);

  return (
    <ThemeContext.Provider
      value={{
        themeColor,
        setThemeColor,
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
