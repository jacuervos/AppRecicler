import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import IconAwesome from 'react-native-vector-icons/FontAwesome5';
import {Map} from '../screens/Map/Map';
import {History} from '../screens/History/History';
import {colors, fontFamily} from '../utils/constants';
import {View, Text} from 'react-native';

const Tab = createBottomTabNavigator();

const TabComponent = ({}) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'History') {
            iconName = 'history';
          }
          // You can return any component that you like here!
          return (
            <View
              style={{
                backgroundColor: focused ? colors.primary : 'transparent',
                borderRadius: 5,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-evenly',
                width:'60%',
                paddingHorizontal:10 ,
                paddingVertical:5,
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
                {route.name === 'Map' ? 'Mapa' : 'Historial' }
              </Text>
            </View>
          );
        },
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
        component={Map}
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
