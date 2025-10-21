import React from 'react';
import {Text} from 'react-native';
import { IPrincipalText } from './IPrincipalText';


export const PrincipalText: React.FC<IPrincipalText> = ({text, styles}) => {
  return <Text style={styles}>{text}</Text>;
};