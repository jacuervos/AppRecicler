export interface OrderTypeWaste {
  id: number;
  order_id: number;
  type_waste_id: number;
  type_waste: string | null;
  weight: number;
  points: number;
}

export interface OrderState {
  id: number;
  name: string;
  color: string;
}

export interface OrderHistoryItem {
  id: number;
  latitude: number;
  longitude: number;
  date: string;
  user: Record<string, any> | null;
  collector: Record<string, any> | null;
  type_waste: OrderTypeWaste[];
  state: OrderState;
}
