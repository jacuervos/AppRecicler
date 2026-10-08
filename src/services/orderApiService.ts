import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderHistoryItem } from '../types/order.types';

const ORDERS_API_URL = 'https://ms-order-ejh2bwafatarb7cx.canadacentral-01.azurewebsites.net/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

const orderApiService = {
  getMyCollections: async (): Promise<OrderHistoryItem[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${ORDERS_API_URL}/orders/my-collections`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener las colecciones');
    }
    const data = await response.json();
    return data.data;
  },

  acceptOrder: async (orderId: number): Promise<any> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${ORDERS_API_URL}/orders/${orderId}/accept`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al aceptar la orden');
    }
    const data = await response.json();
    return data;
  },
};

export { orderApiService };
