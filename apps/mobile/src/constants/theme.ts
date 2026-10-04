/**
 * Theme tokens for the Dhansplit app.
 * Modern palette: lavender/violet gradients, dark accents, luminous clean whites.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A2E',
    background: '#F5F0FF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EDE5FF',
    textSecondary: '#6B7280',
    accent: '#7C3AED',
    accentLight: '#C4B5FD',
    surface: '#FFFFFF',
    border: '#E8E1F5',
    card: '#FFFFFF',
    primary: '#1A1A2E',
    positive: '#10B981',
    negative: '#F43F5E',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0C0C14',
    backgroundElement: '#1A1A28',
    backgroundSelected: '#2A2A3C',
    textSecondary: '#9CA3AF',
    accent: '#A78BFA',
    accentLight: '#7C3AED',
    surface: '#1A1A28',
    border: '#2A2A3C',
    card: '#1A1A28',
    primary: '#FFFFFF',
    positive: '#34D399',
    negative: '#FB7185',
  },
} as const;

export const Gradients = {
  light: {
    // Ethereal modern lavender wash matching the reference UI
    screen: ['#EBE2F9', '#F6F1FD', '#FFFFFF', '#ECE3FA'] as const,
    screenLocations: [0, 0.35, 0.7, 1] as const,
    header: ['#ECE2F9', '#F7F2FE', 'rgba(255,255,255,0)'] as const,
    cardHeader: ['#EFE7FD', '#FAF7FE'] as const,
    banner: ['#E8DBFC', '#F2EAFF', '#E1CEFC'] as const,
    coinAura: ['rgba(196, 181, 253, 0.45)', 'rgba(237, 233, 254, 0.1)', 'transparent'] as const,
    button: ['#1A1A2E', '#11111E'] as const,
  },
  dark: {
    screen: ['#1A132E', '#130F23', '#0A0812', '#1B1431'] as const,
    screenLocations: [0, 0.35, 0.7, 1] as const,
    header: ['#231742', '#16102A', 'rgba(12,12,20,0)'] as const,
    cardHeader: ['#2A1D4A', '#1C1630'] as const,
    banner: ['#311E5E', '#231644', '#1B1134'] as const,
    coinAura: ['rgba(139, 92, 246, 0.25)', 'rgba(109, 40, 217, 0.05)', 'transparent'] as const,
    button: ['#FFFFFF', '#E5E7EB'] as const,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
