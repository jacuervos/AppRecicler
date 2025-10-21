import {StyleProp, ViewStyle} from 'react-native';

export interface IPrincipalInputSelect {
  label: string;
  value: string;
  valueChange: string;
  change: (value: string, text: string) => void;
  options: IOptions[];
  style: StyleProp<ViewStyle>;
  error: boolean | undefined;
}

export interface IOptions {
  label: string;
  value: string;
}
