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

// Types for register credentials
export interface RegisterCredentials {
  email: string;
  password: string;
  password_confirmation: string;
  name: string;
  phone: string;
  identification: string;
  type_identification: number;
  images: string;
  identification_document: string;
  driving_license_document: string;
}

// Types for API responses
export interface RegisterResponse {
  code: number;
  message: string;
}
