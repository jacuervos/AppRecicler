import React from 'react';
import {Dropdown} from 'react-native-element-dropdown';
import {IPrincipalInputSelect} from './IPrincipalInputSelect';
import {colors} from '../../utils/constants';

export const PrincipalInputSelect: React.FC<IPrincipalInputSelect> = ({
  label,
  value,
  valueChange,
  change,
  options,
  style,
  error,
}) => {
  return (
    <Dropdown
      style={[
        style,
        {
          borderBottomColor: error ? colors.error : colors.black,
          borderBottomWidth: error ? 2 : 0.5,
        },
      ]}
      placeholderStyle={{color: error ? colors.error : colors.text}}
      selectedTextStyle={{color: colors.text}}
      iconColor={error ? colors.error : colors.text}
      data={options}
      placeholder={label}
      search={false}
      maxHeight={300}
      labelField="label"
      valueField="value"
      value={value}
      onChange={item => {
        change(valueChange, item.value);
      }}
    />
  );
};
