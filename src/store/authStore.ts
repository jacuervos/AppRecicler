import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthState, ChangePasswordCredentials, LoginCredentials, RegisterCredentials} from '../types/auth.types';
import { authApiService } from '../services/authApiService';

interface AuthActions {
  // Authentication actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  validateCode: (code: string) => Promise<void>;
  changePassword: (credentials: ChangePasswordCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<void>;

  // State management actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Initialize app - check for stored auth data
  initializeAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      token: null,
      userInfo: null,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      register: async (credentials: RegisterCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authApiService.register(credentials);

          if (response.code === 200) {
            // Post Login
            let values = {
              email: credentials.email,
              password: credentials.password,
            };
            await get().login(values);
          } else {
            throw new Error(response.message || 'Error en el registro');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authApiService.login(credentials);

          if (response.success) {
            set({
              isAuthenticated: true,
              token: response.data.access_token,
              isLoading: false,
              error: null,
            });

            // Get user info after successful login
            await get().getUserInfo();
          } else {
            throw new Error(response.message || 'Error en el login');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
          set({
            isAuthenticated: false,
            token: null,
            userInfo: null,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      validateCode: async (code: string) => {
        try {
          set({ isLoading: true, error: null });

         const response = await authApiService.validateCode(code);
          if (response === 'Código valido, ahora cambia la contraseña') {
            set({ isLoading: false });
          } else {
            set({ isLoading: false, error: response });
            throw new Error(response || 'Error en el servidor');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      changePassword: async (credentials: ChangePasswordCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authApiService.changePassword(credentials);
          if (response === 'Contraseña cambiada ya puede iniciar sesión.') {
            set({ isLoading: false });
          } else {
            set({ isLoading: false, error: response });
            throw new Error(response || 'Error en el servidor');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      getUserInfo: async () => {
        try {
          set({ isLoading: true, error: null });

          const response = await authApiService.getUserInfo();

          if (response.success) {
            set({
              userInfo: response.data,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.message || 'Error al obtener información del usuario');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al obtener información del usuario';
          set({
            userInfo: null,
            isLoading: false,
            error: errorMessage,
          });

          // If error is 401, logout user
          if (error instanceof Error && error.message.includes('401')) {
            await get().logout();
          }

          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });

          await authApiService.logout();

          set({
            isAuthenticated: false,
            token: null,
            userInfo: null,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true, error: null });

          const isAuthenticated = await authApiService.isAuthenticated();
          const storedToken = await authApiService.getStoredToken();
          const storedUserInfo = await authApiService.getStoredUserInfo();

          if (isAuthenticated && storedToken) {
            set({
              isAuthenticated: true,
              token: storedToken,
              userInfo: storedUserInfo,
              isLoading: false,
              error: null,
            });

            // Try to refresh user info
            try {
              await get().getUserInfo();
            } catch (error) {
              // If refresh fails, user might need to login again
              console.warn('Failed to refresh user info on app init:', error);
            }
          } else {
            set({
              isAuthenticated: false,
              token: null,
              userInfo: null,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({
            isAuthenticated: false,
            token: null,
            userInfo: null,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the essential auth state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        userInfo: state.userInfo,
      }),
    }
  )
);

export default useAuthStore;
