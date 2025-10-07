// Types for API responses
export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    rol: string;
  };
  message: string;
}

export interface UserInfo {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  identification: string;
  photo: string | null;
  rol: {
    id: number;
    name: string;
  };
  state: {
    id: number;
    name: string;
    color: string;
  };
}

export interface UserInfoResponse {
  success: boolean;
  data: UserInfo;
  message: string;
}

// Types for login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Type for auth state
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
}
