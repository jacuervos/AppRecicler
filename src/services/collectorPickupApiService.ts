import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://ms-order-ejh2bwafatarb7cx.canadacentral-01.azurewebsites.net/api';

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
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('access_token');
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
      const response = await this.api.get<PickupPointsResponse>('/pickup-points');
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


}

export const collectorPickupApiService = new CollectorPickupApiService();
