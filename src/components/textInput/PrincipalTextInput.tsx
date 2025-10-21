import React from 'react';
import {TextInput} from 'react-native-paper';
import {IPrincipalTextInput} from './IPrincipalTextInput';
import { colors } from '../../utils/constants';

export const PrincipalTextInput: React.FC<IPrincipalTextInput> = ({
  value,
  valueChange,
  change,
  style,
  label,
  mode,
  security,
  keyboard,
  error,
}) => {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={text => change(valueChange, text)}
      mode={mode}
      style={style}
      keyboardType={keyboard}
      theme={{
        colors: {
          primary: colors.primary,
          error: colors.error,
          text: colors.black,
        },
      }}
      textColor={colors.text}
      secureTextEntry={security}
      error={error}
    />
  );
};
