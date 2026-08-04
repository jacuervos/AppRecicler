import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import {IHeader} from './Iheader.tsx';
import headerStyles from './styles.tsx';
import { useAuth } from '../../hooks/useAuth.ts';

export const Header: React.FC<IHeader> = ({action}) => {
    const {userInfo } = useAuth();
  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.title}>Hola {userInfo?.name ?? 'Usuario'}</Text>
      <Pressable onPress={action}>
        <Image
          source={require('../../../assets/images/login.png')}
          style={headerStyles.image}
        />
      </Pressable>
    </View>
  );
};
