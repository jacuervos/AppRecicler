/*!
 * Copyright (c) Laika LLC. All rights reserved.
 * HU-19: Visualización de puntos de recogida para el recolector
 */

import React, { ReactElement, useCallback, useEffect, useState, useRef } from 'react';
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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MapLibreRN from '@maplibre/maplibre-react-native';
const { MapView, Camera, ShapeSource, SymbolLayer, LineLayer, Images } = MapLibreRN;
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Header } from '../../components/header/Header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontFamily, shadows } from '../../utils/constants';
import { collectorPickupApiService } from '../../services/collectorPickupApiService';
import useOrderStore from '../../store/orderStore';

const { width } = Dimensions.get('window');
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const TRACKING_INTERVAL_MS = 30000;
const ADDRESS_CACHE_PREFIX = 'point_reverse_geocode:';
const ADDRESS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
    zIndex: 20,
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.white,
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
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    ...shadows.sm,
    maxWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statItem: {
    marginBottom: 0,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: fontFamily.fontFamilyRegular,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fontFamily.fontFamilySemiBold,
    color: colors.primary,
    marginTop: 1,
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
  trackingBanner: {
    marginLeft: 2,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.border || '#f0f0f0',
    maxWidth: 92,
  },
  trackingTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: fontFamily.fontFamilyRegular,
  },
  trackingValue: {
    marginTop: 2,
    fontSize: 12,
    color: colors.primary,
    fontFamily: fontFamily.fontFamilySemiBold,
  },
  trackingAddress: {
    marginTop: 4,
    fontSize: 11,
    color: colors.text,
    fontFamily: fontFamily.fontFamilyRegular,
  },
  startRouteButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  arrivedButton: {
    backgroundColor: colors.success || '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  routeButtonText: {
    color: colors.white,
    fontFamily: fontFamily.fontFamilySemiBold,
    fontSize: 12,
  },
});

/**
 * @component MapScreen
 * HU-19: Visualización de puntos de recogida para el recolector
 * @return {ReactElement} - React component
 */
export const MapScreen = (): ReactElement => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const fetchMyCollections = useOrderStore((state) => state.fetchMyCollections);
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
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [isTrackingRoute, setIsTrackingRoute] = useState(false);
  const [activeRoutePoint, setActiveRoutePoint] = useState<PickupPoint | null>(null);
  const [resolvedAddresses, setResolvedAddresses] = useState<Record<string, string>>({});
  const [loadingAddressKeys, setLoadingAddressKeys] = useState<string[]>([]);
  const [completingOrderId, setCompletingOrderId] = useState<number | null>(null);
  const lastSentAtRef = useRef(0);

  const getPointAddressKey = (point: PickupPoint): string => (
    `${point.latitude.toFixed(5)}:${point.longitude.toFixed(5)}`
  );

  const getAddress = async (lat: number, lon: number): Promise<string> => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'es',
        'User-Agent': 'AppRecicler/1.0',
      },
    });

    const data = await res.json();

    return data?.name || data?.display_name || 'Sin dirección';
  };

  const resolveAddressByPoint = useCallback(async (point: PickupPoint): Promise<void> => {
    const pointKey = getPointAddressKey(point);
    const cacheKey = `${ADDRESS_CACHE_PREFIX}${pointKey}`;

    if (resolvedAddresses[pointKey]) {
      return;
    }

    setLoadingAddressKeys((prev) => (prev.includes(pointKey) ? prev : [...prev, pointKey]));

    try {
      const cached = await AsyncStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached) as { address: string; timestamp: number };
        const isFresh = Date.now() - parsed.timestamp < ADDRESS_CACHE_TTL_MS;

        if (isFresh && parsed.address) {
          setResolvedAddresses((prev) => ({ ...prev, [pointKey]: parsed.address }));
          return;
        }
      }

      const address = await getAddress(point.latitude, point.longitude);

      setResolvedAddresses((prev) => ({ ...prev, [pointKey]: address }));
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({ address, timestamp: Date.now() }),
      );
    } catch (error_) {
      console.error('Error resolving point address:', error_);
      setResolvedAddresses((prev) => ({ ...prev, [pointKey]: getPointAddress(point) }));
    } finally {
      setLoadingAddressKeys((prev) => prev.filter((k) => k !== pointKey));
    }
  }, [resolvedAddresses]);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        return await MapLibreRN.requestAndroidLocationPermissions();
      } catch (error_) {
        console.error('Error requesting Android location permissions:', error_);
        return false;
      }
    }

    return true;
  };

  const sendLocationToApiIfNeeded = useCallback(async (
    location: LocationCoords,
    force = false,
  ): Promise<void> => {
    if (!isTrackingRoute && !force) {
      return;
    }

    const now = Date.now();
    if (!force && now - lastSentAtRef.current < TRACKING_INTERVAL_MS) {
      return;
    }

    try {
      await updateCollectorLocation(location);
      lastSentAtRef.current = now;
    } catch (error_) {
      console.error('Error sending location to API:', error_);
    }
  }, [isTrackingRoute]);

  const loadLastKnownLocation = useCallback(async (forceSend = false): Promise<void> => {
    try {
      const lastKnownLocation = await MapLibreRN.LocationManager.getLastKnownLocation();

      if (lastKnownLocation?.coords) {
        const location = {
          latitude: lastKnownLocation.coords.latitude,
          longitude: lastKnownLocation.coords.longitude,
        };

        setCurrentLocation(location);
        await sendLocationToApiIfNeeded(location, forceSend);
      }
    } catch (err) {
      console.error('Error loading last known location:', err);
    }
  }, [sendLocationToApiIfNeeded]);

  const handleUserLocationUpdate = async (locationEvent: any) => {
    if (!locationEvent?.coords) {
      return;
    }

    const location = {
      latitude: locationEvent.coords.latitude,
      longitude: locationEvent.coords.longitude,
    };

    setCurrentLocation(location);
    await sendLocationToApiIfNeeded(location);
  };

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

  // Actualizar ubicación del recolector en el servidor
  const updateCollectorLocation = async (location: LocationCoords) => {
    try {
      await collectorPickupApiService.updateMyLocation(location);
    } catch (err) {
      console.error('Error updating collector location:', err);
    }
  };

  // Marcar punto como completado
  const completePickupPoint = async (orderId: number) => {
    setCompletingOrderId(orderId);

    try {
      const data = await collectorPickupApiService.completePickupPoint(orderId);
      if (data.success) {
        Alert.alert('Éxito', 'Punto de recogida marcado como completado');
        await Promise.all([
          fetchPickupPoints(),
          fetchMyCollections(),
        ]);
        setShowDetails(false);

        if (activeRoutePoint?.order_id === orderId) {
          setIsTrackingRoute(false);
          setActiveRoutePoint(null);
          lastSentAtRef.current = 0;
        }
      } else {
        Alert.alert('Error', data.message || 'No se pudo marcar como completado');
      }
    } catch (err) {
      Alert.alert('Error', 'Error al completar el punto');
      console.error('Error completing pickup point:', err);
    } finally {
      setCompletingOrderId(null);
    }
  };

  const confirmCompletePickupPoint = (point: PickupPoint) => {
    Alert.alert(
      'Confirmar completado',
      `¿Deseas marcar como completada la orden #${point.order_id}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, completar',
          onPress: () => completePickupPoint(point.order_id),
        },
      ],
    );
  };

  // Cargar datos iniciales
  useEffect(() => {
    requestLocationPermission().catch((permissionError) => {
      console.error('Error requesting location permission:', permissionError);
    });

    loadLastKnownLocation();
    fetchPickupPoints();
  }, [loadLastKnownLocation]);

  const startTrackingToPoint = async (point: PickupPoint) => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert(
        'Permiso requerido',
        'Debes habilitar permisos de ubicación para enviar tu ubicación al punto.',
      );
      return;
    }

    setActiveRoutePoint(point);
    setIsTrackingRoute(true);
    lastSentAtRef.current = 0;
    await loadLastKnownLocation(true);
    setShowDetails(false);

    Alert.alert('Ruta iniciada', `Ahora estás enviando ubicación para llegar a ${point.user_name}.`);
  };

  const requestRouteChange = (point: PickupPoint) => {
    if (!activeRoutePoint || activeRoutePoint.id === point.id) {
      startTrackingToPoint(point);
      return;
    }

    Alert.alert(
      'Cambiar destino activo',
      `Actualmente vas hacia ${activeRoutePoint.user_name}. ¿Quieres cambiar a ${point.user_name}?`,
      [
        {
          text: 'No cambiar',
          style: 'cancel',
        },
        {
          text: 'Sí, cambiar',
          onPress: () => startTrackingToPoint(point),
        },
      ],
    );
  };

  const markArrivedAndStopTracking = () => {
    const targetName = activeRoutePoint?.user_name || 'el punto';

    setIsTrackingRoute(false);
    setActiveRoutePoint(null);
    lastSentAtRef.current = 0;
    setShowDetails(false);

    Alert.alert('Llegada registrada', `Se dejó de enviar ubicación para ${targetName}.`);
  };

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
    loadLastKnownLocation();
    fetchPickupPoints();
  };

  const getPointAddress = (point: PickupPoint): string => {
    const address = point.address?.trim();
    if (address) {
      return address;
    }

    return `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
  };

  const completedCount = pickupPoints.filter(p => p.completed_at).length;
  const pendingCount = pickupPoints.length - completedCount;

  const getTrackingAddressText = (): string => {
    if (!isTrackingRoute || !activeRoutePoint) {
      return 'Selecciona un punto para ver dirección de destino';
    }

    if (loadingAddressKeys.includes(getPointAddressKey(activeRoutePoint))) {
      return 'Buscando dirección...';
    }

    return resolvedAddresses[getPointAddressKey(activeRoutePoint)] || getPointAddress(activeRoutePoint);
  };

  useEffect(() => {
    if (activeRoutePoint) {
      resolveAddressByPoint(activeRoutePoint);
    }
  }, [activeRoutePoint, resolveAddressByPoint]);

  useEffect(() => {
    if (selectedPoint) {
      resolveAddressByPoint(selectedPoint);
    }
  }, [selectedPoint, resolveAddressByPoint]);

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
        <Images
          images={{
            collectorIcon: require('../../../assets/images/recolector.png'),
            pickupIcon: require('../../../assets/images/recogida.png'),
          }}
        />

        <MapLibreRN.UserLocation
          visible={false}
          minDisplacement={3}
          onUpdate={handleUserLocationUpdate}
        />

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
            <SymbolLayer
              id="collector-layer"
              style={{
                iconImage: 'collectorIcon',
                iconSize: 0.14,
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
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
            <SymbolLayer
              id="pickup-completed-layer"
              filter={['==', ['get', 'completed'], true]}
              style={{
                iconImage: 'pickupIcon',
                iconSize: 0.11,
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
                iconOpacity: 0.65,
              }}
            />
            <SymbolLayer
              id="pickup-pending-layer"
              filter={['==', ['get', 'completed'], false]}
              style={{
                iconImage: 'pickupIcon',
                iconSize: 0.11,
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
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
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{pickupPoints.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pend.</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}> 
            {pendingCount}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Comp.</Text>
          <Text style={[styles.statValue, { color: colors.success || '#4CAF50' }]}>
            {completedCount}
          </Text>
        </View>

        <View style={styles.trackingBanner}>
          <Text style={styles.trackingTitle}>Estado de ubicación</Text>
          <Text style={styles.trackingValue}>
            {isTrackingRoute && activeRoutePoint
              ? `En camino a ${activeRoutePoint.user_name}`
              : 'Ubicación en pausa'}
          </Text>
          <Text style={styles.trackingAddress} numberOfLines={2}>
            {getTrackingAddressText()}
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
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Icon name="sync-alt" solid size={18} color={colors.white} />
        )}
      </TouchableOpacity>

      {/* Lista de puntos */}
      <View
        style={[
          styles.listContainer,
          isListCollapsed && { maxHeight: 64 },
        ]}
      >
        <TouchableOpacity
          style={styles.listHeader}
          onPress={() => setIsListCollapsed((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Text style={styles.listHeaderTitle}>
            Puntos de Recogida ({pendingCount})
          </Text>
          <Icon
            name={isListCollapsed ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {!isListCollapsed && (
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
                  onPress={() => confirmCompletePickupPoint(point)}
                  disabled={completingOrderId === point.order_id}
                >
                  {completingOrderId === point.order_id ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.completeButtonText}>Marcar completado</Text>
                  )}
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
          </ScrollView>
        )}
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
                  <Text style={styles.detailsLabel}>Dirección de recogida</Text>
                  <Text style={styles.detailsValue}>
                    {loadingAddressKeys.includes(getPointAddressKey(selectedPoint))
                      ? 'Buscando dirección...'
                      : (resolvedAddresses[getPointAddressKey(selectedPoint)] || getPointAddress(selectedPoint))}
                  </Text>
                </View>

                {isTrackingRoute && activeRoutePoint?.id === selectedPoint.id && (
                  <View style={styles.detailsContent}>
                    <Text style={styles.detailsLabel}>Estado del punto</Text>
                    <Text style={[styles.detailsValue, { color: colors.primary }]}>Destino actual en camino</Text>
                  </View>
                )}

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

                {!isTrackingRoute || activeRoutePoint?.id !== selectedPoint.id ? (
                  <TouchableOpacity
                    style={styles.startRouteButton}
                    onPress={() => requestRouteChange(selectedPoint)}
                  >
                    <Text style={styles.routeButtonText}>Voy para este punto</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.arrivedButton}
                    onPress={markArrivedAndStopTracking}
                  >
                    <Text style={styles.routeButtonText}>Ya llegué (detener ubicación)</Text>
                  </TouchableOpacity>
                )}

                {!selectedPoint.completed_at ? (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => confirmCompletePickupPoint(selectedPoint)}
                    disabled={completingOrderId === selectedPoint.order_id}
                  >
                    {completingOrderId === selectedPoint.order_id ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.completeButtonText}>Marcar Completado</Text>
                    )}
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
