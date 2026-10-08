import { create } from 'zustand';
import { orderApiService } from '../services/orderApiService';
import { OrderHistoryItem } from '../types/order.types';

interface OrderStore {
  myCollections: OrderHistoryItem[];
  loading: boolean;
  error: string | null;
  fetchMyCollections: () => Promise<void>;
}

const useOrderStore = create<OrderStore>(set => ({
  myCollections: [],
  loading: false,
  error: null,

  fetchMyCollections: async () => {
    set({ loading: true, error: null });
    try {
      const collections = await orderApiService.getMyCollections();
      set({ loading: false, myCollections: collections });
    } catch (error: any) {
      set({
        loading: false,
        error: error?.message || 'Error al obtener las colecciones',
      });
    }
  },
}));

export default useOrderStore;
