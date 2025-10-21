/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {Fragment} from 'react';
import {StatusBar, SafeAreaView} from 'react-native';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Navigation from './src/navigations/Navigation';
import {colors} from './src/utils/constants';

const App = () => {
  return (
    <Fragment>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaView style={{flex: 0, backgroundColor: colors.primary}} />
        <SafeAreaView style={{flex: 1}}>
          <StatusBar animated={true} backgroundColor="#51B055" />
          <BottomSheetModalProvider>
            <Navigation />
          </BottomSheetModalProvider>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Fragment>
  );
};

export default App;
