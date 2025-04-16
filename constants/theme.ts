import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Primary colors
  primaryBlue: '#00E5FF',
  primaryBlueDark: '#00ADFF',
  primaryPink: '#FF47D2',
  primaryPinkDark: '#FF2876',
  
  // UI colors
  background: '#000000',
  backgroundLight: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.15)',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textPlaceholder: '#999999',
  
  // Status colors
  success: '#1AE92F',
  error: '#FF3B55',
  warning: '#FFB930',

  // Gradients
  gradientBlue: ['#00E5FF', '#00ADFF'],
  gradientPink: ['#FF47D2', '#FF2876'],
  gradientOverlayDark: ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)'],
  gradientOverlayMedium: ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)'],
};

export const FONTS = {
  // Font families
  bangers: 'Bangers',
  roboto: 'Roboto',
  robotoBold: 'Roboto-Bold',
  
  // Font sizes
  h1: 60,
  h2: 40,
  h3: 24,
  body: 16,
  button: 18,
  caption: 14,
};

export const SPACING = {
  xs: 5,
  s: 10,
  m: 15,
  l: 20,
  xl: 30,
  xxl: 40,
};

export const LAYOUT = {
  width,
  height,
  fullWidth: '100%',
  fullHeight: '100%',
  border: {
    radius: {
      small: 5,
      medium: 10,
      large: 30,
    },
    width: 1,
  },
  input: {
    height: 55,
  },
  button: {
    height: 55,
  },
};

export const ANIMATION = {
  duration: {
    fast: 100,
    medium: 300,
    slow: 500,
    extraSlow: 800,
  },
  scale: {
    pressed: 0.95,
    normal: 1,
    emphasis: 1.2,
  },
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  }),
};

export default {
  COLORS,
  FONTS,
  SPACING,
  LAYOUT,
  ANIMATION,
  SHADOWS,
}; 