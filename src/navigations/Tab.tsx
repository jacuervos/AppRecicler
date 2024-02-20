import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import IconAwesome from 'react-native-vector-icons/FontAwesome5';
import {Map} from '../screens/Map/Map';
import {History} from '../screens/History/History';

const Tab = createBottomTabNavigator();

const TabComponent = ({route}) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'History') {
            iconName = 'history';
          }
          // You can return any component that you like here!
          return <IconAwesome name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        gestureEnabled: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          borderTopWidth: 0,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
      })}>
      <Tab.Screen
        name="Map"
        component={Map}
        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{
          tabBarLabel: 'Historial',
        }}
      />
    </Tab.Navigator>
  );
};
export default TabComponent;
