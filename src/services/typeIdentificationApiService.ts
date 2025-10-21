import axios, {AxiosInstance, AxiosResponse} from 'axios';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginCredentials,
  LoginResponse,
  UserInfoResponse,
} from '../types/auth.types';
import {TypeIdentificationResponse} from "../types/typeIdentification.types.ts";

class TypeIdentificationApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL =
      Config.AUTH_API_URL ||
      'https://ms-auth-eha5d8bchthmdtd7.centralus-01.azurewebsites.net/api';

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10000,
    });

    // Interceptor to add token to requests
    this.api.interceptors.request.use(
      async config => {
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
      error => {
        return Promise.reject(error);
      },
    );

    // Interceptor to handle responses and errors
    this.api.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await AsyncStorage.multiRemove(['access_token', 'user_info']);
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Get current user information
   * @returns User information
   */
  async getTypeIdentifications(): Promise<TypeIdentificationResponse[]> {
    try {
      const response: AxiosResponse<TypeIdentificationResponse[]> =
        await this.api.get('/type_identifications');
      return response.data;
    } catch (error) {
      console.error('Get user info error:', error);
      throw this.handleError(error);
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
      const message =
        error.response.data?.message ||
        `Error ${error.response.status}: ${error.response.statusText}`;
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error(
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      );
    } else {
      // Something else happened
      return new Error(error.message || 'Ocurrió un error inesperado');
    }
  }
}

// Export singleton instance
export const typeIdentificationApiService = new TypeIdentificationApiService();
export default typeIdentificationApiService;
