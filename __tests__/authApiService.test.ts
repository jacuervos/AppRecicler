import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock('../src/services/pushNotificationService', () => ({
  __esModule: true,
  default: {
    getToken: jest.fn().mockResolvedValue(null),
  },
}));

describe('authApiService', () => {
  const httpClient = {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.create as jest.Mock).mockReturnValue(httpClient);
  });

  it('stores the access token after login', async () => {
    httpClient.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          access_token: 'recycler-token',
          rol: 'Recolector',
        },
      },
    });

    httpClient.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 1,
          name: 'Carlos Perez',
          phone: '3110000000',
          email: 'carlos@example.com',
          address: null,
          identification: '900800700',
          photo: null,
          rol: { id: 3, name: 'Recolector' },
          state: { id: 1, name: 'Habilitado', color: 'green' },
        },
        message: 'ok',
      },
    });

    const { authApiService } = require('../src/services/authApiService');

    const response = await authApiService.login({
      email: 'recycler@example.com',
      password: 'secret123',
    });

    expect(response.data.access_token).toBe('recycler-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('access_token', 'recycler-token');
    expect(httpClient.post).toHaveBeenCalledWith('/login', {
      email: 'recycler@example.com',
      password: 'secret123',
    });
  });

  it('stores the user info after loading profile', async () => {
    httpClient.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 1,
          name: 'Carlos Perez',
          phone: '3110000000',
          email: 'carlos@example.com',
          address: null,
          identification: '900800700',
          photo: null,
          rol: { id: 3, name: 'Recolector' },
          state: { id: 1, name: 'Habilitado', color: 'green' },
        },
        message: 'ok',
      },
    });

    const { authApiService } = require('../src/services/authApiService');

    const response = await authApiService.getUserInfo();

    expect(response.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user_info',
      expect.stringContaining('Carlos Perez')
    );
    expect(httpClient.get).toHaveBeenCalledWith('/auth_me');
  });

  it('registers a recycler with required documents', async () => {
    httpClient.post.mockResolvedValue({
      data: {
        code: 200,
        message: 'Se ha creado el recolector correctamente',
      },
    });

    const { authApiService } = require('../src/services/authApiService');

    const response = await authApiService.register({
      name: 'Carlos Perez',
      phone: '3110000000',
      identification: '900800700',
      type_identification: 1,
      email: 'carlos@example.com',
      password: 'secret123',
      password_confirmation: 'secret123',
      images: 'file:///tmp/recycler-photo.png',
      identification_document: 'file:///tmp/recycler-id.pdf',
      driving_license_document: 'file:///tmp/recycler-license.pdf',
    });

    expect(response.code).toBe(200);
    expect(httpClient.post).toHaveBeenCalledWith(
      '/register_controller',
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'multipart/form-data',
        }),
      })
    );
  });
});