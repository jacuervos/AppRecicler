import axios from 'axios';

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
  const httpClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.create as jest.Mock).mockReturnValue(httpClient);
  });

  it('HU-22: retrieves assigned pickup points route for the collector', async () => {
    httpClient.get.mockResolvedValue({
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
            {
              id: 22,
              order_id: 22,
              latitude: 4.63,
              longitude: -74.08,
              address: 'Carrera 15 #80-10',
              completed_at: null,
              state_name: 'Inicio de servicio',
              is_picked_up: false,
              user_name: 'Pedro Gomez',
              user_phone: '3109876543',
            },
          ],
        },
      },
    });

    const { collectorPickupApiService } = require('../src/services/collectorPickupApiService');

    const response = await collectorPickupApiService.getMyPickupPoints();

    expect(response.success).toBe(true);
    expect(response.data.total_points).toBe(2);
    expect(response.data.pickup_points[0].user_name).toBe('Maria Lopez');
    expect(httpClient.get).toHaveBeenCalledWith('/pickup-points');
  });

  it('HU-24: marks a pickup point as picked up when collector collects waste', async () => {
    httpClient.put.mockResolvedValue({
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

    const { collectorPickupApiService } = require('../src/services/collectorPickupApiService');

    const response = await collectorPickupApiService.markPickupPointAsPicked(21);

    expect(response.success).toBe(true);
    expect(response.message).toBe('Orden marcada como recogida');
    expect(httpClient.put).toHaveBeenCalledWith('/orders/21/picked-up');
  });

  it('HU-24: completes a pickup point after waste collection confirmation', async () => {
    httpClient.put.mockResolvedValue({
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

    const { collectorPickupApiService } = require('../src/services/collectorPickupApiService');

    const response = await collectorPickupApiService.completePickupPoint(21);

    expect(response.success).toBe(true);
    expect(response.message).toBe('Orden marcada como completada');
    expect(httpClient.put).toHaveBeenCalledWith('/orders/21/complete');
  });
});

