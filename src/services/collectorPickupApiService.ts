import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://your-api-url/api';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface PickupPoint {
  id: number;
  order_id: number;
  latitude: number;
  longitude: number;
  address: string;
  notes?: string;
  completed_at: string | null;
  user_name: string;
  user_phone?: string;
}

interface PickupPointsResponse {
  success: boolean;
  data: {
    total_points: number;
    pickup_points: PickupPoint[];
  };
}

interface LocationUpdateResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    collector_id: number;
    latitude: number;
    longitude: number;
    updated_at: string;
  };
}

interface CompletePointResponse {
  success: boolean;
  message: string;
  data: PickupPoint;
}

interface OrderDetailsResponse {
  success: boolean;
  data: {
    order: {
      id: number;
      user_name: string;
      user_phone?: string;
      scheduled_date: string;
      status: string;
    };
    pickup_points: PickupPoint[];
  };
}

class CollectorPickupApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token'); // Obtener del auth store
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * HU-19: Obtener los puntos de recogida asignados al recolector
   */
  async getMyPickupPoints(): Promise<PickupPointsResponse> {
    try {
      const response = await this.api.get<PickupPointsResponse>('/collector/pickup-points');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Actualizar la ubicación actual del recolector
   */
  async updateMyLocation(location: LocationCoords): Promise<LocationUpdateResponse> {
    try {
      const response = await this.api.post<LocationUpdateResponse>(
        '/collector/location',
        location
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Marcar un punto de recogida como completado
   */
  async completePickupPoint(pointId: number): Promise<CompletePointResponse> {
    try {
      const response = await this.api.patch<CompletePointResponse>(
        `/pickup-point/${pointId}/complete`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Obtener detalles de una orden específica
   */
  async getOrderDetails(orderId: number): Promise<OrderDetailsResponse> {
    try {
      const response = await this.api.get<OrderDetailsResponse>(
        `/collector/order/${orderId}/details`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Obtener el historial de ubicaciones del recolector
   */
  async getLocationHistory(collectorId: number, limit: number = 50) {
    try {
      const response = await this.api.get(
        `/collector/location/history/${collectorId}?limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}

export const collectorPickupApiService = new CollectorPickupApiService();
