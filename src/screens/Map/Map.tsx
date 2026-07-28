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
import * as MapLibreRN from '@maplibre/maplibre-react-native';
const { MapView, Camera, ShapeSource, CircleLayer, LineLayer } = MapLibreRN;
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Header } from '../../components/header/Header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontFamily, shadows } from '../../utils/constants';
import { collectorPickupApiService } from '../../services/collectorPickupApiService';

const { width, height } = Dimensions.get('window');
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

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
    fontFamily: fontFamily.fontFamilyBold,
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
    fontFamily: fontFamily.fontFamilySemiBold,
    color: colors.text,
    marginBottom: 4,
  },
  pointItemAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fontFamily.fontFamilyRegular,
    marginBottom: 4,
  },
  pointItemUser: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: fontFamily.fontFamilySemiBold,
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
    fontFamily: fontFamily.fontFamilySemiBold,
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
    fontFamily: fontFamily.fontFamilySemiBold,
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
    fontFamily: fontFamily.fontFamilySemiBold,
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
    fontFamily: fontFamily.fontFamilySemiBold,
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
    fontFamily: fontFamily.fontFamilyRegular,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamily.fontFamilySemiBold,
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
    fontFamily: fontFamily.fontFamilyBold,
    color: colors.text,
    marginBottom: 12,
  },
  detailsContent: {
    marginBottom: 12,
  },
  detailsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fontFamily.fontFamilyRegular,
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fontFamily.fontFamilySemiBold,
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
    fontFamily: fontFamily.fontFamilySemiBold,
    color: colors.primary,
  },
});

/**
 * @component MapScreen
 * HU-19: Visualización de puntos de recogida para el recolector
 * @return {ReactElement} - React component
 */
export const MapScreen = (): ReactElement => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const mapViewRef = useRef(null);
  const [cameraConfig, setCameraConfig] = useState({
    centerCoordinate: [-74.0721, 4.7110], // [longitude, latitude]
    zoomLevel: 14,
    animationDuration: 1000,
  });

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
      const data = await collectorPickupApiService.getMyPickupPoints();
      if (data.success) {
        setPickupPoints(data.data.pickup_points);
        setError(null);
      } else {
        setError('Error al cargar los puntos de recogida');
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
      const location = false;
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
      await collectorPickupApiService.updateMyLocation(location);
    } catch (err) {
      console.error('Error updating collector location:', err);
    }
  };

  // Marcar punto como completado
  const completePickupPoint = async (pointId: number) => {
    try {
      const data = await collectorPickupApiService.completePickupPoint(pointId);
      if (data.success) {
        Alert.alert('Éxito', 'Punto de recogida marcado como completado');
        fetchPickupPoints();
        setShowDetails(false);
      } else {
        Alert.alert('Error', data.message || 'No se pudo marcar como completado');
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
    if (pickupPoints.length > 0) {
      const coordinates = pickupPoints.map(point => [
        point.longitude,
        point.latitude,
      ]);

      if (currentLocation) {
        coordinates.unshift([currentLocation.longitude, currentLocation.latitude]);
      }

      // Calcular bounds de las coordenadas
      let minLon = coordinates[0][0];
      let maxLon = coordinates[0][0];
      let minLat = coordinates[0][1];
      let maxLat = coordinates[0][1];

      coordinates.forEach(coord => {
        minLon = Math.min(minLon, coord[0]);
        maxLon = Math.max(maxLon, coord[0]);
        minLat = Math.min(minLat, coord[1]);
        maxLat = Math.max(maxLat, coord[1]);
      });

      // Calcular el centro y zoom
      const centerLon = (minLon + maxLon) / 2;
      const centerLat = (minLat + maxLat) / 2;

      // Estimar zoom level basado en la distancia
      const maxDelta = Math.max(maxLon - minLon, maxLat - minLat);
      const zoomLevel = Math.min(16, Math.max(10, 14 - Math.log2(maxDelta * 111)));

      setCameraConfig({
        centerCoordinate: [centerLon, centerLat],
        zoomLevel: zoomLevel,
        animationDuration: 1000,
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
        mapStyle={MAP_STYLE_URL}
      >
        <Camera
          centerCoordinate={cameraConfig.centerCoordinate}
          zoomLevel={cameraConfig.zoomLevel}
        />

        {/* Capa del marcador del recolector */}
        {currentLocation && (
          <ShapeSource
            id="collector-source"
            shape={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  id: 'collector',
                  properties: { title: 'Tu ubicación' },
                  geometry: {
                    type: 'Point',
                    coordinates: [currentLocation.longitude, currentLocation.latitude],
                  },
                },
              ],
            }}
          >
            <CircleLayer
              id="collector-layer"
              style={{
                circleRadius: 22,
                circleColor: colors.primary,
                circleOpacity: 1,
                circleStrokeWidth: 3,
                circleStrokeColor: colors.white,
              }}
            />
          </ShapeSource>
        )}

        {/* Capa de marcadores de puntos de recogida */}
        {pickupPoints.length > 0 && (
          <ShapeSource
            id="pickup-points-source"
            shape={{
              type: 'FeatureCollection',
              features: pickupPoints.map(point => ({
                type: 'Feature',
                id: point.id,
                properties: {
                  title: point.user_name,
                  address: point.address,
                  completed: !!point.completed_at,
                  order_id: point.order_id,
                },
                geometry: {
                  type: 'Point',
                  coordinates: [point.longitude, point.latitude],
                },
              })),
            }}
            onPress={(event: any) => {
              if (event.features.length > 0) {
                const feature = event.features[0];
                const pointId = feature.id as number;
                const point = pickupPoints.find(p => p.id === pointId);
                if (point) {
                  setSelectedPoint(point);
                  setShowDetails(true);
                }
              }
            }}
          >
            <CircleLayer
              id="pickup-completed-layer"
              filter={['==', ['get', 'completed'], true]}
              style={{
                circleRadius: 17,
                circleColor: colors.success || '#4CAF50',
                circleOpacity: 0.8,
              }}
            />
            <CircleLayer
              id="pickup-pending-layer"
              filter={['==', ['get', 'completed'], false]}
              style={{
                circleRadius: 17,
                circleColor: colors.secondary,
                circleOpacity: 0.8,
              }}
            />
          </ShapeSource>
        )}

        {/* Línea de ruta entre puntos */}
        {pickupPoints.length > 1 && (
          <ShapeSource
            id="route-line-source"
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: pickupPoints.map(p => [p.longitude, p.latitude]),
              },
            }}
          >
            <LineLayer
              id="route-line-layer"
              style={{
                lineColor: colors.primary,
                lineWidth: 3,
                lineOpacity: 0.7,
              }}
            />
          </ShapeSource>
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
