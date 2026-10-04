import { useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useThemeStore, type ThemePreference } from '@/lib/theme-store';

export type { ThemePreference };

export function useAppTheme() {
  const { theme, setTheme } = useThemeStore();
  const systemScheme = useRNColorScheme();
  const { colorScheme: nwScheme, setColorScheme } = useNativeWindColorScheme();

  const isDark =
    theme === 'system'
      ? systemScheme === 'dark'
      : theme === 'dark';

  const effectiveScheme: 'light' | 'dark' = isDark ? 'dark' : 'light';

  useEffect(() => {
    setColorScheme(theme === 'system' ? 'system' : theme);
  }, [theme, setColorScheme]);

  return {
    theme,
    isDark,
    colorScheme: effectiveScheme,
    setTheme,
    colors: Colors[effectiveScheme],
  };
}

export function useTheme() {
  const { colors } = useAppTheme();
  return colors;
}
