/*!
 * Copyright (c) Laika LLC. All rights reserved.
 */

import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {ReactElement} from 'react';
import {colors, fontFamily} from '../../utils/constants';
import {useAuth} from '../../hooks/useAuth';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';

/**
 * @component Account View
 * @return {ReactElement} - React component
 */
export const Account = (): ReactElement => {
  const {userInfo, logout, isLoading} = useAuth();
  const navigation = useNavigation();

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
              // La navegación se maneja automáticamente por el hook useAuth
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="user-times" size={50} color={colors.gray} />
        <Text style={styles.errorText}>No se pudo cargar la información del usuario</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botón de regreso */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Header con gradiente */}
      <LinearGradient
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={[colors.primary, '#45A049']}>
        <View style={styles.profileImageContainer}>
          <Icon name="user" size={40} color={colors.white} />
        </View>
        <Text style={styles.welcomeText}>¡Hola, {userInfo.name}!</Text>
        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>{userInfo.rol.name}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="envelope" size={16} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue}>{userInfo.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="phone" size={16} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{userInfo.phone}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="id-card" size={16} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Identificación</Text>
                <Text style={styles.infoValue}>{userInfo.identification}</Text>
              </View>
            </View>

            {userInfo.address && (
              <View style={styles.infoRow}>
                <Icon name="map-marker-alt" size={16} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>{userInfo.address}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Estado de la Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de la Cuenta</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="check-circle" size={16} color={userInfo.state.color} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Estado</Text>
                <Text style={[styles.stateValue, {color: userInfo.state.color}]}>
                  {userInfo.state.name}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="user-tag" size={16} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Rol</Text>
                <Text style={styles.infoValue}>{userInfo.rol.name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="hashtag" size={16} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ID de Usuario</Text>
                <Text style={styles.infoValue}>{userInfo.id}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Opciones de Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones</Text>
          
          <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}>
            <Icon name="edit" size={16} color={colors.primary} />
            <Text style={styles.optionText}>Editar Perfil</Text>
            <Icon name="chevron-right" size={12} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}>
            <Icon name="bell" size={16} color={colors.primary} />
            <Text style={styles.optionText}>Notificaciones</Text>
            <Icon name="chevron-right" size={12} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}>
            <Icon name="question-circle" size={16} color={colors.primary} />
            <Text style={styles.optionText}>Ayuda y Soporte</Text>
            <Icon name="chevron-right" size={12} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Botón de Cerrar Sesión */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="sign-out-alt" size={16} color={colors.white} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.text,
    textAlign: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: fontFamily.fontFamilyBold,
    color: colors.white,
    marginBottom: 10,
  },
  roleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  roleText: {
    fontSize: 14,
    fontFamily: fontFamily.fontFamilySemiBold,
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFamily.fontFamilyBold,
    color: colors.black,
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.gray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: fontFamily.fontFamilySemiBold,
    color: colors.black,
  },
  stateValue: {
    fontSize: 16,
    fontFamily: fontFamily.fontFamilyBold,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.black,
  },
  logoutSection: {
    marginTop: 30,
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC3545',
    padding: 15,
    borderRadius: 12,
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
    marginLeft: 10,
    fontSize: 16,
    fontFamily: fontFamily.fontFamilyBold,
    color: colors.white,
  },
});
