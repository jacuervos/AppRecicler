import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn().mockResolvedValue('recycler-jwt-token'),
    multiRemove: jest.fn(),
  },
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

describe('collectorPickupApiService (Sprint 3 - AppRecicler)', () => {
  let reqInterceptor: any;

  const httpClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(fn => {
          reqInterceptor = fn;
        }),
      },
      response: { use: jest.fn() },
    },
  };

  (axios.create as jest.Mock).mockReturnValue(httpClient);
  const {
    collectorPickupApiService,
  } = require('../src/services/collectorPickupApiService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds Bearer token in request interceptor when token exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('recycler-jwt-token');
    const configWithToken = await reqInterceptor({ headers: {} });
    expect(configWithToken.headers.Authorization).toBe('Bearer recycler-jwt-token');

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const configWithoutToken = await reqInterceptor({ headers: {} });
    expect(configWithoutToken.headers.Authorization).toBeUndefined();
  });

  it('HU-22: retrieves assigned pickup points route for the collector and handles errors', async () => {
    httpClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          total_points: 2,
          pickup_points: [
            {
              id: 21,
              order_id: 21,
              latitude: 4.62,
              longitude: -74.07,
              address: 'Calle 40 #13-50',
              completed_at: null,
              state_name: 'Inicio de servicio',
              is_picked_up: false,
              user_name: 'Maria Lopez',
              user_phone: '3001234567',
            },
          ],
        },
      },
    });

    const response = await collectorPickupApiService.getMyPickupPoints();
    expect(response.success).toBe(true);
    expect(response.data.pickup_points[0].user_name).toBe('Maria Lopez');
    expect(httpClient.get).toHaveBeenCalledWith('/pickup-points');

    httpClient.get.mockRejectedValueOnce({ response: { data: { message: 'Error ruta' } } });
    await expect(collectorPickupApiService.getMyPickupPoints()).rejects.toEqual({
      message: 'Error ruta',
    });
  });

  it('updates collector live location and handles error', async () => {
    httpClient.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Ubicación actualizada',
        data: {
          id: 1,
          collector_id: 4,
          latitude: 4.65,
          longitude: -74.06,
          updated_at: '2026-10-17T10:00:00Z',
        },
      },
    });

    const res = await collectorPickupApiService.updateMyLocation({
      latitude: 4.65,
      longitude: -74.06,
    });
    expect(res.success).toBe(true);
    expect(httpClient.post).toHaveBeenCalledWith('/collector/location', {
      latitude: 4.65,
      longitude: -74.06,
    });

    httpClient.post.mockRejectedValueOnce(new Error('Location network error'));
    await expect(
      collectorPickupApiService.updateMyLocation({ latitude: 4.65, longitude: -74.06 }),
    ).rejects.toThrow('Location network error');
  });

  it('HU-24: marks a pickup point as picked up and completes order', async () => {
    httpClient.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Orden marcada como recogida',
        data: {
          id: 21,
          order_id: 21,
          state_name: 'Recogido',
          is_picked_up: true,
        },
      },
    });

    const pickedResponse = await collectorPickupApiService.markPickupPointAsPicked(21);
    expect(pickedResponse.success).toBe(true);
    expect(httpClient.put).toHaveBeenCalledWith('/orders/21/picked-up');

    httpClient.put.mockRejectedValueOnce({ response: { data: { message: 'Error recogida' } } });
    await expect(collectorPickupApiService.markPickupPointAsPicked(21)).rejects.toEqual({
      message: 'Error recogida',
    });

    httpClient.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Orden marcada como completada',
        data: {
          id: 21,
          order_id: 21,
          state_name: 'Orden finalizada',
          is_picked_up: true,
        },
      },
    });

    const completeResponse = await collectorPickupApiService.completePickupPoint(21);
    expect(completeResponse.success).toBe(true);
    expect(httpClient.put).toHaveBeenCalledWith('/orders/21/complete');

    httpClient.put.mockRejectedValueOnce(new Error('Complete failed'));
    await expect(collectorPickupApiService.completePickupPoint(21)).rejects.toThrow(
      'Complete failed',
    );
  });
});
