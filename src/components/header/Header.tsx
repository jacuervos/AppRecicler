import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import {IHeader} from './Iheader.tsx';
import headerStyles from './styles.tsx';

export const Header: React.FC<IHeader> = ({action}) => {
  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.title}>Hola Alejandro</Text>
      <Pressable onPress={action}>
        <Image
          source={require('../../../assets/images/login.png')}
          style={headerStyles.image}
        />
      </Pressable>
    </View>
  );
};
