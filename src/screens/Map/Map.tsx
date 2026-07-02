/*!
 * Copyright (c) Laika LLC. All rights reserved.
 * HU-19: Visualización de puntos de recogida para el recolector
 */

import React, { ReactElement, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Header } from '../../components/header/Header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontFamily, shadows } from '../../utils/constants';
import { getCurrentLocation } from '../../functions/Geolocation';

const { width, height } = Dimensions.get('window');

interface PickupPoint {
  id: number;
  order_id: number;
  latitude: number;
  longitude: number;
  address: string;
  notes?: string;
  completed_at: string | null;
  user_name: string;
  user_phone?: string;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

type RootStackParamList = {
  Account: undefined;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  collectorMarker: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  pickupMarker: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  pickupMarkerCompleted: {
    backgroundColor: colors.success || '#4CAF50',
  },
  markerIcon: {
    color: colors.white,
    fontSize: 14,
  },
  listContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    maxHeight: '35%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...shadows.lg,
  },
  listHeader: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  pointItem: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    ...shadows.sm,
  },
  pointItemCompleted: {
    borderLeftColor: colors.success || '#4CAF50',
    opacity: 0.6,
  },
  pointItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamily.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  pointItemAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    marginBottom: 4,
  },
  pointItemUser: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: fontFamily.semibold,
    marginBottom: 8,
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  completeButtonText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: 12,
  },
  completedBadge: {
    backgroundColor: colors.success || '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  completedBadgeText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: 11,
  },
  floatingButton: {
    position: 'absolute',
    top: 80,
    right: 15,
    backgroundColor: colors.white,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    fontFamily: fontFamily.semibold,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: 14,
  },
  statsContainer: {
    position: 'absolute',
    top: 80,
    left: 15,
    right: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    ...shadows.md,
    maxWidth: 160,
  },
  statItem: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamily.semibold,
    color: colors.primary,
    marginTop: 2,
  },
  detailsModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    color: colors.text,
    marginBottom: 12,
  },
  detailsContent: {
    marginBottom: 12,
  },
  detailsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fontFamily.semibold,
    color: colors.text,
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: fontFamily.semibold,
    color: colors.primary,
  },
});

/**
 * @component Map
 * HU-19: Visualización de puntos de recogida para el recolector
 * @return {ReactElement} - React component
 */
export const Map = (): ReactElement => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const mapViewRef = useRef<MapView>(null);

  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<PickupPoint | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Obtener puntos de recogida
  const fetchPickupPoints = async () => {
    try {
      const response = await fetch('http://your-api-url/api/collector/pickup-points', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${/* get token from auth store */}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setError('Error al obtener los puntos de recogida');
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setPickupPoints(data.data.pickup_points);
        setError(null);
      } else {
        setError(data.message || 'Error desconocido');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
      console.error('Error fetching pickup points:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Obtener ubicación actual del recolector
  const fetchCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        // Enviar ubicación al servidor
        await updateCollectorLocation(location);
      }
    } catch (err) {
      console.error('Error getting current location:', err);
    }
  };

  // Actualizar ubicación del recolector en el servidor
  const updateCollectorLocation = async (location: LocationCoords) => {
    try {
      await fetch('http://your-api-url/api/collector/location', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${/* get token from auth store */}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });
    } catch (err) {
      console.error('Error updating collector location:', err);
    }
  };

  // Marcar punto como completado
  const completePickupPoint = async (pointId: number) => {
    try {
      const response = await fetch(
        `http://your-api-url/api/pickup-point/${pointId}/complete`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${/* get token from auth store */}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        Alert.alert('Éxito', 'Punto de recogida marcado como completado');
        fetchPickupPoints();
        setShowDetails(false);
      } else {
        Alert.alert('Error', 'No se pudo marcar como completado');
      }
    } catch (err) {
      Alert.alert('Error', 'Error al completar el punto');
      console.error('Error completing pickup point:', err);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchCurrentLocation();
    fetchPickupPoints();
  }, []);

  // Actualizar ubicación cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCurrentLocation();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Animar el mapa para mostrar todos los puntos
  useEffect(() => {
    if (pickupPoints.length > 0 && mapViewRef.current) {
      const coordinates = pickupPoints.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
      }));

      if (currentLocation) {
        coordinates.unshift(currentLocation);
      }

      mapViewRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  }, [pickupPoints, currentLocation]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCurrentLocation();
    fetchPickupPoints();
  };

  const completedCount = pickupPoints.filter(p => p.completed_at).length;
  const pendingCount = pickupPoints.length - completedCount;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.errorText, { color: colors.text, marginTop: 15 }]}>
          Cargando puntos de recogida...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header action={() => navigation.navigate('Account')} />

      <MapView
        ref={mapViewRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude ?? 4.7110,
          longitude: currentLocation?.longitude ?? -74.0721,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Marcador del recolector actual */}
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Tu ubicación">
            <View style={styles.markerContainer}>
              <View style={styles.collectorMarker}>
                <Icon name="user" style={styles.markerIcon} />
              </View>
            </View>
          </Marker>
        )}

        {/* Marcadores de puntos de recogida */}
        {pickupPoints.map((point) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            title={point.user_name}
            description={point.address}
            onPress={() => {
              setSelectedPoint(point);
              setShowDetails(true);
            }}
          >
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.pickupMarker,
                  point.completed_at && styles.pickupMarkerCompleted,
                ]}
              >
                <Icon
                  name={point.completed_at ? 'check' : 'bag'}
                  style={styles.markerIcon}
                />
              </View>
            </View>
          </Marker>
        ))}

        {/* Línea de ruta entre puntos */}
        {pickupPoints.length > 1 && (
          <Polyline
            coordinates={pickupPoints.map(p => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }))}
            strokeColor={colors.primary}
            strokeWidth={2}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total de puntos</Text>
          <Text style={styles.statValue}>{pickupPoints.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pendientes</Text>
          <Text style={[styles.statValue, { color: colors.secondary }]}>
            {pendingCount}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Completados</Text>
          <Text style={[styles.statValue, { color: colors.success || '#4CAF50' }]}>
            {completedCount}
          </Text>
        </View>
      </View>

      {/* Botón de actualización */}
      <TouchableOpacity
        style={[styles.floatingButton, { top: 80 + (width > 400 ? 80 : 60) }]}
        onPress={handleRefresh}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Icon name="sync" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>

      {/* Lista de puntos */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderTitle}>
            Puntos de Recogida ({pendingCount})
          </Text>
          <Icon name="chevron-up" size={16} color={colors.textSecondary} />
        </View>
        <ScrollView style={styles.listContent} showsVerticalScrollIndicator={false}>
          {pickupPoints.map((point) => (
            <TouchableOpacity
              key={point.id}
              style={[
                styles.pointItem,
                point.completed_at && styles.pointItemCompleted,
              ]}
              onPress={() => {
                setSelectedPoint(point);
                setShowDetails(true);
              }}
            >
              <Text style={styles.pointItemTitle}>
                {point.user_name}
              </Text>
              <Text style={styles.pointItemAddress}>
                📍 {point.address}
              </Text>
              <Text style={styles.pointItemUser}>
                Orden #{point.order_id}
              </Text>

              {point.completed_at ? (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓ Completado</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => completePickupPoint(point.id)}
                >
                  <Text style={styles.completeButtonText}>Marcar completado</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Modal de detalles */}
      <Modal
        visible={showDetails && !!selectedPoint}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={styles.detailsModal}>
            <Text style={styles.detailsTitle}>Detalles del Punto</Text>

            {selectedPoint && (
              <>
                <View style={styles.detailsContent}>
                  <Text style={styles.detailsLabel}>Nombre del Usuario</Text>
                  <Text style={styles.detailsValue}>{selectedPoint.user_name}</Text>
                </View>

                <View style={styles.detailsContent}>
                  <Text style={styles.detailsLabel}>Dirección</Text>
                  <Text style={styles.detailsValue}>{selectedPoint.address}</Text>
                </View>

                {selectedPoint.user_phone && (
                  <View style={styles.detailsContent}>
                    <Text style={styles.detailsLabel}>Teléfono</Text>
                    <Text style={styles.detailsValue}>{selectedPoint.user_phone}</Text>
                  </View>
                )}

                {selectedPoint.notes && (
                  <View style={styles.detailsContent}>
                    <Text style={styles.detailsLabel}>Notas</Text>
                    <Text style={styles.detailsValue}>{selectedPoint.notes}</Text>
                  </View>
                )}

                {!selectedPoint.completed_at ? (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => {
                      completePickupPoint(selectedPoint.id);
                    }}
                  >
                    <Text style={styles.completeButtonText}>Marcar Completado</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Completado</Text>
                  </View>
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
