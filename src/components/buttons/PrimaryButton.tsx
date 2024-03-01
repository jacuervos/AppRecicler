import React from 'react';
import {Pressable} from 'react-native';
import buttonsStyles from './styles.tsx';
import { IPrimaryButton } from './IPrimaryButton.tsx';
import { PrincipalText } from '../texts/PrincipalText.tsx';


export const PrimaryButton: React.FC<IPrimaryButton> = ({
  text,
  backgroundColor,
  disabled,
  height,
  width,
  action
}) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={action}
      style={{
        ...buttonsStyles.containerPrimary,
        width:width,
        height: height,
        backgroundColor: backgroundColor,
      }}>
        <PrincipalText text={text} styles={buttonsStyles.textButtonPrimary} />
    </Pressable>
  );
};