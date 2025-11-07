import * as React from 'react';
import {Platform} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import InitView from '../screens/InitView/InitView';
import TabComponent from './Tab';
import {Account} from '../screens/Account/Account';
import Register from '../screens/Register/Register';
import ChangePassword from '../screens/ChangePassword/ChangePassword';

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Platform.OS === 'ios' ? 'white' : 'transparent',
  },
};

const Navigation = () => {
    return (
        <NavigationContainer
            theme={MyTheme}
        >
            <Stack.Navigator screenOptions={{ gestureEnabled: false }}>
                <Stack.Screen options={{ headerShown: false }} name="InitView" component={InitView} />
                <Stack.Screen options={{ headerShown: false }} name="Register" component={Register} />
                <Stack.Screen options={{ headerShown: false }} name="Tab" component={TabComponent} />
                <Stack.Screen options={{ headerShown: false }} name="Account" component={Account} />
                <Stack.Screen options={{ headerShown: false }} name="ChangePassword" component={ChangePassword} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
export default Navigation;
