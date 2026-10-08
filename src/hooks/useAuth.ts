import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import {ChangePasswordCredentials, LoginCredentials, RegisterCredentials} from '../types/auth.types';

/**
 * Custom hook for authentication operations
 * Provides easy access to auth state and actions
 */
export const useAuth = () => {
  const {
    // State
    isAuthenticated,
    token,
    userInfo,
    isLoading,
    error,

    // Actions
    login,
    register,
    validateCode,
    changePassword,
    logout,
    getUserInfo,
    setLoading,
    setError,
    clearError,
    initializeAuth,
  } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Register with credentials
   */
  const handleRegister = async (credentials: RegisterCredentials) => {
    try {
      await register(credentials);
    } catch (error) {
      // Error is already handled in the store
      throw error;
    }
  };

  /**
   * Login with credentials
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
    } catch (error) {
      // Error is already handled in the store
      throw error;
    }
  };

  /**
   * Logout user
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Error is already handled in the store
      console.error('Logout error:', error);
    }
  };

  /**
   * Refresh user information
   */
  const refreshUserInfo = async () => {
    try {
      await getUserInfo();
    } catch (error) {
      // Error is already handled in the store
      throw error;
    }
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (roleName: string): boolean => {
    return userInfo?.rol?.name === roleName;
  };

  /**
   * Check if user is enabled
   */
  const isUserEnabled = (): boolean => {
    return userInfo?.state?.name === 'Habilitado';
  };

  /**
   * Get user's role name
   */
  const getUserRole = (): string | null => {
    return userInfo?.rol?.name || null;
  };

  /**
   * Get user's state
   */
  const getUserState = (): { name: string; color: string } | null => {
    if (!userInfo?.state) return null;
    return {
      name: userInfo.state.name,
      color: userInfo.state.color,
    };
  };

  /**
   * Validate Code with credentials
   */
  const handleValidateCode = async (code: string) => {
    try {
      await validateCode(code);
    } catch (error) {
      // Error is already handled in the store
      throw error;
    }
  };

  /**
   * Change password with credentials
   */
  const handleChangePassword = async (values: ChangePasswordCredentials) => {
    try {
      await changePassword(values);
    } catch (error) {
      // Error is already handled in the store
      throw error;
    }
  };

  return {
    // State
    isAuthenticated,
    token,
    userInfo,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    validateCode: handleValidateCode,
    changePassword: handleChangePassword,
    refreshUserInfo,
    clearError,

    // Utility functions
    hasRole,
    isUserEnabled,
    getUserRole,
    getUserState,
  };
};

export default useAuth;
