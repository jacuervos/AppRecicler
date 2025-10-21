import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, LoginResponse, UserInfoResponse } from '../types/auth.types';

class AuthApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = 'https://ms-auth-eha5d8bchthmdtd7.centralus-01.azurewebsites.net/api';

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    // Interceptor to add token to requests
    this.api.interceptors.request.use(
      async (config) => {
        // NO agregar token en login
        if (config.url?.includes('/login')) {
          console.log('Login request - skipping token');
          return config;
        }

        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor to handle responses and errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await AsyncStorage.multiRemove(['access_token', 'user_info']);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Login user with email and password
   * @param credentials - Email and password
   * @returns Login response with token and role
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('=== LOGIN DEBUG ===');
      console.log('Base URL:', this.baseURL);
      console.log('Full URL:', `${this.baseURL}/login`);
      console.log('Credentials:', { email: credentials.email, password: credentials.password});

      const response: AxiosResponse<LoginResponse> = await this.api.post('/login', credentials);

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      // Save token to AsyncStorage
      if (response.data.success && response.data.data.access_token) {
        await AsyncStorage.setItem('access_token', response.data.data.access_token);
        console.log('Token guardado exitosamente');
      }

      return response.data;
    } catch (error: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request headers:', error.config?.headers);
      throw this.handleError(error);
    }
  }

  /**
   * Get current user information
   * @returns User information
   */
  async getUserInfo(): Promise<UserInfoResponse> {
    try {
      const response: AxiosResponse<UserInfoResponse> = await this.api.get('/me');

      // Save user info to AsyncStorage
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem('user_info', JSON.stringify(response.data.data));
      }

      return response.data;
    } catch (error) {
      console.error('Get user info error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Logout user - clear tokens and data
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['access_token', 'user_info']);
    } catch (error) {
      console.error('Logout error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if user has valid token
   * @returns boolean indicating if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return !!token;
    } catch (error) {
      console.error('Check authentication error:', error);
      return false;
    }
  }

  /**
   * Get stored token
   * @returns stored access token or null
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Get stored token error:', error);
      return null;
    }
  }

  /**
   * Get stored user info
   * @returns stored user info or null
   */
  async getStoredUserInfo(): Promise<any | null> {
    try {
      const userInfo = await AsyncStorage.getItem('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Get stored user info error:', error);
      return null;
    }
  }

  /**
   * Handle API errors
   * @param error - Error from API call
   * @returns formatted error message
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      // Something else happened
      return new Error(error.message || 'Ocurrió un error inesperado');
    }
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
export default authApiService;
