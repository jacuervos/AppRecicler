import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors, fontFamily } from '../utils/constants';

interface LogoutButtonProps {
  style?: any;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ style }) => {
  const { logout, userInfo } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      {userInfo && (
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Hola, {userInfo.name}</Text>
          <Text style={styles.roleText}>{userInfo.rol.name}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: fontFamily.fontFamilyBold,
    color: colors.black,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.primary,
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fontFamily.fontFamilyBold,
  },
});

export default LogoutButton;
