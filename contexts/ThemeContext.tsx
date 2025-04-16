import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from '../constants/theme';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Define colors for each theme
type ThemeColors = typeof COLORS;

const lightThemeColors: ThemeColors = {
  ...COLORS,
  // Override dark theme colors with light theme colors
  background: '#FFFFFF',
  backgroundLight: 'rgba(0, 0, 0, 0.05)',
  border: 'rgba(0, 0, 0, 0.1)',
  text: '#000000',
  textSecondary: '#555555',
  textPlaceholder: '#777777',
  gradientOverlayDark: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.85)'],
  gradientOverlayMedium: ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.9)'],
};

const darkThemeColors: ThemeColors = {
  ...COLORS,
  // The default COLORS is already configured for dark mode
};

// Theme context type
interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  isDark: true,
  colors: darkThemeColors,
  setMode: () => {},
  toggleMode: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'system',
}) => {
  // Get device color scheme
  const colorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  
  // Determine if we're in dark mode
  const isDark = 
    mode === 'system' 
      ? colorScheme === 'dark' 
      : mode === 'dark';
  
  // Set colors based on the theme
  const colors = isDark ? darkThemeColors : lightThemeColors;
  
  // Toggle between light and dark modes
  const toggleMode = () => {
    setMode(prevMode => {
      if (prevMode === 'system') {
        return colorScheme === 'dark' ? 'light' : 'dark';
      } else {
        return prevMode === 'dark' ? 'light' : 'dark';
      }
    });
  };
  
  // Update theme when system preference changes
  useEffect(() => {
    if (mode === 'system') {
      // We don't need to do anything here, as the isDark calculation will handle it
    }
  }, [colorScheme, mode]);
  
  const contextValue: ThemeContextType = {
    mode,
    isDark,
    colors,
    setMode,
    toggleMode,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 