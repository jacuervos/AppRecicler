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
  let reqFulfilled: any;
  let reqRejected: any;
  let resFulfilled: any;
  let resRejected: any;

  const httpClient = {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn((onFulfilled, onRejected) => {
          reqFulfilled = onFulfilled;
          reqRejected = onRejected;
        }),
      },
      response: {
        use: jest.fn((onFulfilled, onRejected) => {
          resFulfilled = onFulfilled;
          resRejected = onRejected;
        }),
      },
    },
  };

  (axios.create as jest.Mock).mockReturnValue(httpClient);
  const { authApiService } = require('../src/services/authApiService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures request and response interceptors properly', async () => {
    const loginConfig = await reqFulfilled({ url: '/login', headers: {} });
    expect(loginConfig.headers.Authorization).toBeUndefined();

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('stored-token');
    const authConfig = await reqFulfilled({ url: '/auth_me', headers: {} });
    expect(authConfig.headers.Authorization).toBe('Bearer stored-token');

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const noTokenConfig = await reqFulfilled({ url: '/other', headers: {} });
    expect(noTokenConfig.headers.Authorization).toBeUndefined();

    await expect(reqRejected(new Error('req-err'))).rejects.toThrow('req-err');

    const okRes = { status: 200 };
    expect(resFulfilled(okRes)).toBe(okRes);

    await expect(resRejected({ response: { status: 401 } })).rejects.toEqual({
      response: { status: 401 },
    });
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['access_token', 'user_info']);

    await expect(resRejected({ response: { status: 500 } })).rejects.toEqual({
      response: { status: 500 },
    });
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

    const response = await authApiService.getUserInfo();

    expect(response.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user_info',
      expect.stringContaining('Carlos Perez'),
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
      }),
    );
  });

  it('sends a password recovery email, validates code, and changes the recycler password', async () => {
    httpClient.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Código enviado',
      },
    });

    const forgotRes = await authApiService.forgotPassword({ email: 'carlos@example.com' });
    expect(forgotRes.success).toBe(true);
    expect(httpClient.post).toHaveBeenCalledWith('/send_code', { email: 'carlos@example.com' });

    httpClient.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Código válido',
      },
    });

    const validateMsg = await authApiService.validateCode('654321');
    expect(validateMsg).toBe('Código válido');
    expect(httpClient.post).toHaveBeenCalledWith('/validate_code', { code: '654321' });

    httpClient.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Contraseña actualizada',
      },
    });

    const changeMsg = await authApiService.changePassword({
      email: 'carlos@example.com',
      code: '654321',
      password: 'NuevaPass123',
      password_confirmation: 'NuevaPass123',
    });

    expect(changeMsg).toBe('Contraseña actualizada');
    expect(httpClient.post).toHaveBeenCalledWith('/change_password', {
      email: 'carlos@example.com',
      code: '654321',
      password: 'NuevaPass123',
      password_confirmation: 'NuevaPass123',
    });
  });

  it('manages firebase token, logout, and storage helpers', async () => {
    httpClient.post.mockResolvedValueOnce({ data: { success: true } });
    await authApiService.updateFirebaseToken('fcm-123');
    expect(httpClient.post).toHaveBeenCalledWith('/firebase-token', {
      firebase_token: 'fcm-123',
    });

    await authApiService.logout();
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['access_token', 'user_info']);

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('jwt-tok');
    expect(await authApiService.isAuthenticated()).toBe(true);

    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('storage err'));
    expect(await authApiService.isAuthenticated()).toBe(false);

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('jwt-tok');
    expect(await authApiService.getStoredToken()).toBe('jwt-tok');

    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('storage err'));
    expect(await authApiService.getStoredToken()).toBeNull();

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify({ id: 9 }));
    expect(await authApiService.getStoredUserInfo()).toEqual({ id: 9 });

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    expect(await authApiService.getStoredUserInfo()).toBeNull();

    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('storage err'));
    expect(await authApiService.getStoredUserInfo()).toBeNull();
  });

  it('formats API, network, and unexpected errors across methods', async () => {
    httpClient.post.mockRejectedValueOnce({
      response: { status: 422, statusText: 'Unprocessable', data: { message: 'Datos inválidos' } },
    });
    await expect(
      authApiService.login({ email: 'a@b.com', password: '123' }),
    ).rejects.toThrow('Datos inválidos');

    httpClient.post.mockRejectedValueOnce({
      response: { status: 500, statusText: 'Server Error', data: {} },
    });
    await expect(authApiService.updateFirebaseToken('tok')).rejects.toThrow(
      'Error 500: Server Error',
    );

    httpClient.get.mockRejectedValueOnce({ request: {} });
    await expect(authApiService.getUserInfo()).rejects.toThrow(
      'No se pudo conectar con el servidor',
    );

    httpClient.post.mockRejectedValueOnce(new Error('Fallo local'));
    await expect(authApiService.forgotPassword({ email: 'a@b.com' })).rejects.toThrow(
      'Fallo local',
    );

    httpClient.post.mockRejectedValueOnce({});
    await expect(authApiService.validateCode('000')).rejects.toThrow(
      'Ocurrió un error inesperado',
    );

    httpClient.post.mockRejectedValueOnce(new Error('Cambio fallido'));
    await expect(
      authApiService.changePassword({
        email: 'a@b.com',
        code: '111',
        password: 'pass',
        password_confirmation: 'pass',
      }),
    ).rejects.toThrow('Cambio fallido');

    httpClient.post.mockRejectedValueOnce(new Error('Registro fallido'));
    await expect(
      authApiService.register({
        name: 'Carlos',
        phone: '300',
        identification: '123',
        type_identification: 1,
        email: 'c@b.com',
        password: 'pass',
        password_confirmation: 'pass',
        images: 'file:///a.png',
        identification_document: 'file:///b.pdf',
        driving_license_document: 'file:///c.pdf',
      }),
    ).rejects.toThrow('Registro fallido');

    (AsyncStorage.multiRemove as jest.Mock).mockRejectedValueOnce(new Error('Error limpiando'));
    await expect(authApiService.logout()).rejects.toThrow('Error limpiando');
  });
});