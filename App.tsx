/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {Fragment} from 'react';
import Navigation from './src/navigations/Navigation';
import {StatusBar, SafeAreaView, View, ActivityIndicator, Text} from 'react-native';
import {colors} from './src/utils/constants';

const App = () => {
  return (
    <Fragment>
      <SafeAreaView style={{flex: 0, backgroundColor: colors.primary}} />
      <SafeAreaView style={{flex: 1}}>
        <StatusBar animated={true} backgroundColor="#51B055" />
        <Navigation />
      </SafeAreaView>
    </Fragment>
  );
};

export default App;
