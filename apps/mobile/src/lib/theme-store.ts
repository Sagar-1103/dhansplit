import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from './storage';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system', // system by default as requested
      setTheme: (theme: ThemePreference) => set({ theme }),
    }),
    {
      name: 'dhansplit-theme-store',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
