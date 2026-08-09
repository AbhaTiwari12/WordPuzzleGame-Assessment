import { TextStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};

export const typography: Record<string, TextStyle> = {
  display: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  h1: {
    fontSize: 26,
    fontWeight: '700',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    fontWeight: '500',
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
  },
  gridLetter: {
    fontSize: 18,
    fontWeight: '800',
  },
  wheelLetter: {
    fontSize: 26,
    fontWeight: '800',
  },
};
