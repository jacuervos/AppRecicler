import * as React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InitView } from '../screens/InitView/InitView';


const Stack = createNativeStackNavigator();

const MyTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: Platform.OS === 'ios' ? 'white' : 'transparent'
    },
};

const Navigation = () => {
    return (
        <NavigationContainer
            theme={MyTheme}
        >
            <Stack.Navigator screenOptions={{ gestureEnabled: false }}>
                <Stack.Screen options={{ headerShown: false }} name="InitView" component={InitView} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
export default Navigation;