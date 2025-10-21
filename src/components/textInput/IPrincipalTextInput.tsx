
import {KeyboardTypeOptions, StyleProp, ViewStyle} from 'react-native';

export interface IPrincipalTextInput {
    value: string;
    valueChange: string;
    change: (value: string, text: string) => void;
    style: StyleProp<ViewStyle>;
    label: string;
    mode: 'flat' | 'outlined' | undefined;
    security?: boolean | undefined;
    keyboard: KeyboardTypeOptions | undefined;
    error: boolean | undefined;
  }