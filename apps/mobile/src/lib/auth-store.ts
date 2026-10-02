import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from './storage';

export interface User {
  id: string;
  name: string;
  email: string;
  defaultCurrency?: string;
  isPro?: boolean;
  avatarUrl?: string | null;
  phone?: string | null;
  createdAt?: string;
  photoUri?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken?: string | null) => void;
  setUser: (user: Partial<User> | User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        }),

      setUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : (updatedUser as User),
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'dhansplit-auth-store',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const authStore = {
  getState: () => useAuth.getState(),
  setAuth: (user: User, accessToken: string, refreshToken?: string | null) =>
    useAuth.getState().setAuth(user, accessToken, refreshToken),
  setUser: (user: Partial<User> | User) => useAuth.getState().setUser(user),
  logout: () => useAuth.getState().logout(),
};
