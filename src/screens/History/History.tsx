import {View} from 'react-native';
import React, {ReactElement} from 'react';
import {Header} from '../../components/header/Header';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import HistoryStyles from './styles';
import { CardHistory } from './components/CardHistory';
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
    <View style={HistoryStyles.container}>
      <Header action={() => navigation.navigate('Account')} />
      <CardHistory/>
    </View>
  );
};
