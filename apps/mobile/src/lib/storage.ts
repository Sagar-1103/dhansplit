import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';

export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null;
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(name, value);
        }
      } catch {}
      return;
    }
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(name);
        }
      } catch {}
      return;
    }
    await SecureStore.deleteItemAsync(name);
  },
};
