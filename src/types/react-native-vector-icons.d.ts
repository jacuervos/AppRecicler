declare module 'react-native-vector-icons/FontAwesome5' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    solid?: boolean;
    brand?: boolean;
  }

  const Icon: ComponentType<IconProps>;
  export default Icon;
}

declare module 'react-native-vector-icons/FontAwesome' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  const Icon: ComponentType<IconProps>;
  export default Icon;
}
