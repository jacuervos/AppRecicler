import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import IconAwesome from 'react-native-vector-icons/FontAwesome5';
import {MapScreen} from '../screens/Map/Map';
import {History} from '../screens/History/History';
import {colors, fontFamily} from '../utils/constants';
import {View, Text} from 'react-native';

const Tab = createBottomTabNavigator();

const getTabBarLabel = (routeName: string): string => {
  switch (routeName) {
    case 'Map':
      return 'Mapa';
    case 'History':
      return 'Historial';
    case 'Account':
      return 'Cuenta';
    default:
      return routeName;
  }
};

const getIconName = (routeName: string): string => {
  switch (routeName) {
    case 'Map':
      return 'map';
    case 'History':
      return 'history';
    case 'Account':
      return 'user';
    default:
      return 'home';
  }
};

const TabBarIcon = ({focused, color, size, iconName, label}: {focused: boolean; color: string; size: number; iconName: string; label: string}) => (
  <View
    style={{
      backgroundColor: focused ? colors.primary : 'transparent',
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      width: '60%',
      paddingHorizontal: 10,
      paddingVertical: 5,
    }}>
    <IconAwesome
      name={iconName}
      size={size}
      color={focused ? colors.white : color}
    />
    <Text
      style={{
        color: focused ? colors.white : color,
        fontFamily: fontFamily.fontFamilySemiBold,
        fontSize: 15,
      }}>
      {label}
    </Text>
  </View>
);

const renderTabBarIcon = (route: {name: string}) => ({focused, color, size}: {focused: boolean; color: string; size: number}) => (
  <TabBarIcon
    focused={focused}
    color={color}
    size={size}
    iconName={getIconName(route.name)}
    label={getTabBarLabel(route.name)}
  />
);

const TabComponent = ({}) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: renderTabBarIcon(route),
        headerShown: false,
        gestureEnabled: false,
        tabBarLabelStyle: {
          fontFamily: fontFamily.fontFamilyRegular,
          fontSize: 12,
        },
        tabBarInactiveTintColor:colors.primary ,
        tabBarActiveTintColor: colors.white,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          borderTopWidth: 0,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
      })}>
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarShowLabel: false,
        }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{
          tabBarShowLabel: false,
        }}
      />
    </Tab.Navigator>
  );
};
export default TabComponent;
