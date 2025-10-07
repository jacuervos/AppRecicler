declare module 'react-native-config' {
  export interface NativeConfig {
    AUTH_API_URL?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
