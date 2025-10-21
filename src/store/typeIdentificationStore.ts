import {create} from 'zustand';
import {typeIdentificationApiService} from '../services/typeIdentificationApiService';
import {TypeIdentificationResponse} from '../types/typeIdentification.types.ts';

interface TypeIdentificationStore {
  typeIdentifications: TypeIdentificationResponse[];

  getTypeIdentifications: () => Promise<void>;
}

const useTypeIdentificationStore = create<TypeIdentificationStore>(set => ({
  typeIdentifications: [],

  getTypeIdentifications: async () => {
    try {
      const response =
        await typeIdentificationApiService.getTypeIdentifications();
      if (response.length) {
        set({
          typeIdentifications: response,
        });
      }
    } catch (error) {}
  },
}));

export default useTypeIdentificationStore;
