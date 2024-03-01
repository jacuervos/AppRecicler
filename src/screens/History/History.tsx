/*!
 * Copyright (c) Laika LLC. All rights reserved.
 */

import {StyleSheet, View} from 'react-native';
import React, {ReactElement} from 'react';
import { Header } from '../../components/header/Header';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
/**
 * @component History
 * @return {ReactElement} - React component
 */

type RootStackParamList = {
  Account: undefined;
};
export const History = (): ReactElement => {
  const navigation =
  useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.container}>
     <Header action={() => navigation.navigate('Tab')}/> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
