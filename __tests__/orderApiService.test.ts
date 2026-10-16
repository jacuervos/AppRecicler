import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderApiService } from '../src/services/orderApiService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

describe('orderApiService (Sprint 4 - AppRecicler)', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = mockFetch;
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('recycler-jwt-token');
  });

  it('HU-27: retrieves the history list of collections performed by the collector', async () => {
    const collectorOrders = [
      {
        id: 31,
        latitude: 4.62,
        longitude: -74.07,
        date: '2026-10-24',
        state: { id: 5, name: 'Orden finalizada', color: 'green' },
        type_waste: [
          { id: 1, type_waste_id: 1, name: 'Vidrio', weight: 4.5, points: 45 },
        ],
      },
      {
        id: 29,
        latitude: 4.63,
        longitude: -74.08,
        date: '2026-10-20',
        state: { id: 2, name: 'Asignada a recolector', color: 'purple' },
        type_waste: [
          { id: 2, type_waste_id: 2, name: 'Cartón', weight: 3.0, points: 30 },
        ],
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: collectorOrders,
      }),
    });

    const result = await orderApiService.getMyCollections();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(31);
    expect(result[0].state.name).toBe('Orden finalizada');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/orders/my-collections'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer recycler-jwt-token',
          Accept: 'application/json',
        }),
      })
    );
  });

  it('HU-27: throws an error when fetching collector order history fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Error al obtener las colecciones',
      }),
    });

    await expect(orderApiService.getMyCollections()).rejects.toThrow('Error al obtener las colecciones');
  });
});

