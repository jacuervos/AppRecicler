/*!
 * Copyright (c) Laika LLC. All rights reserved.
 */

import {View} from 'react-native';
import React, {ReactElement} from 'react';
import MapView, {Marker} from 'react-native-maps';
import mapStyles from './styles';
import {Header} from '../../components/header/Header';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
/**
 * @component Map
 * @return {ReactElement} - React component
 */
type RootStackParamList = {
  Account: undefined;
};
export const Map = (): ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={mapStyles.container}>
      <Header action={() => navigation.navigate('Account')} />
      <MapView
        style={mapStyles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
        <Marker
          coordinate={{latitude: 37.78825, longitude: -122.4324}}
          title="Marker title"
          description="Marker description"
        />
      </MapView>
    </View>
  );
};
