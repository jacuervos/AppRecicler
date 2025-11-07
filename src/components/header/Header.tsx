import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import {IHeader} from './Iheader';
import useAuth from '../../hooks/useAuth';
import headerStyles from './styles';

export const Header: React.FC<IHeader> = ({action}) => {
  const {userInfo} = useAuth();
  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.title}>Hola {
          userInfo?.name ? userInfo.name.length > 15 ? userInfo.name.substring(0, 15) + '...' : userInfo.name : ''}</Text>
      <Pressable onPress={action}>
        <Image
          source={userInfo?.photo ? {uri: userInfo.photo} : require('../../../assets/images/login.png')}
          style={headerStyles.image}
        />
      </Pressable>
    </View>
  );
};
