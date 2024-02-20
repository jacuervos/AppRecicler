/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */


import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Navigation from './src/navigations/Navigation';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <Navigation/>
  );
}

export default App;