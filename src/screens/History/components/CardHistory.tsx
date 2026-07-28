/*!
 * Copyright (c) Laika LLC. All rights reserved.
 */

import {View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import React, {ReactElement, useEffect, useState} from 'react';
import CardHistoryStyles from './styles';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {colors} from '../../../utils/constants';
import LinearGradient from 'react-native-linear-gradient';
import useOrderStore from '../../../store/orderStore';
import {OrderHistoryItem} from '../../../types/order.types';
import { orderApiService } from '../../../services/orderApiService';

/**
 * @component Card History
 * @return {ReactElement} - React component
 */
export const CardHistory = (): ReactElement => {
  const { myCollections, loading, error, fetchMyCollections } = useOrderStore();
  const [acceptingOrderId, setAcceptingOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchMyCollections();
  }, []);

  const getStatusColor = (stateName: string) => {
    const name = stateName.toLowerCase();
    if (name.includes('complet') || name.includes('finaliz')) { return colors.primary; }
    if (name.includes('pendi') || name.includes('asignad') || name.includes('inici')) { return '#FFA500'; }
    if (name.includes('cancel')) { return colors.error; }
    return colors.gray;
  };

  const getStatusIcon = (stateName: string) => {
    const name = stateName.toLowerCase();
    if (name.includes('complet') || name.includes('finaliz')) { return 'check-circle'; }
    if (name.includes('cancel')) { return 'times-circle'; }
    return 'clock';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setAcceptingOrderId(orderId);
      const response = await orderApiService.acceptOrder(orderId);
      
      if (response.success) {
        Alert.alert('✅ Éxito', 'Orden aceptada. ¡Iniciando servicio!');
        // Refrescar la lista
        await fetchMyCollections();
      } else {
        Alert.alert('❌ Error', response.message || 'No se pudo aceptar la orden');
      }
    } catch (err: any) {
      Alert.alert('❌ Error', err.message || 'Error al aceptar la orden');
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const isAssignedOrder = (stateName: string) => {
    return stateName.toLowerCase().includes('asignad');
  };

  const completedCollections = myCollections.filter(item => {
    const name = item.state?.name?.toLowerCase() ?? '';
    return name.includes('complet') || name.includes('finaliz');
  });

  const totalWeight = completedCollections.reduce(
    (sum, item) => sum + item.type_waste.reduce((s, w) => s + (w.weight ?? 0), 0),
    0,
  );

  const totalPoints = completedCollections.reduce(
    (sum, item) => sum + item.type_waste.reduce((s, w) => s + (w.points ?? 0), 0),
    0,
  );

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={colors.white} style={{marginTop: 40}} />;
    }
    if (error) {
      return (
        <Text style={{textAlign: 'center', marginTop: 40, color: colors.error, paddingHorizontal: 20}}>
          {error}
        </Text>
      );
    }
    if (myCollections.length === 0) {
      return (
        <View style={CardHistoryStyles.emptyContainer}>
          <Icon name="leaf" size={50} color={colors.gray} />
          <Text style={CardHistoryStyles.emptyText}>No hay registros para mostrar</Text>
          <Text style={CardHistoryStyles.emptySubtext}>
            Comienza a recolectar para ver tu historial
          </Text>
        </View>
      );
    }
    return myCollections.map((item: OrderHistoryItem) => (
      <TouchableOpacity key={item.id} style={CardHistoryStyles.historyCard} disabled={isAssignedOrder(item.state?.name ?? '')}>
        <View style={CardHistoryStyles.cardHeader}>
          <View style={CardHistoryStyles.dateContainer}>
            <Icon name="calendar-alt" size={16} color={colors.primary} />
            <Text style={CardHistoryStyles.dateText}>{formatDate(item.date)}</Text>
          </View>
          <View
            style={[
              CardHistoryStyles.statusBadge,
              {backgroundColor: getStatusColor(item.state?.name ?? '')},
            ]}>
            <Icon name={getStatusIcon(item.state?.name ?? '')} size={12} color={colors.white} />
            <Text style={CardHistoryStyles.statusText}>
              {item.state?.name ?? 'Desconocido'}
            </Text>
          </View>
        </View>

        <View style={CardHistoryStyles.cardContent}>
          <View style={CardHistoryStyles.locationRow}>
            <Icon name="user" size={14} color={colors.gray} />
            <Text style={CardHistoryStyles.locationText}>
              {item.user
                ? [item.user.name, item.user.email, `Usuario #${item.user.id}`].find(Boolean)
                : 'Usuario no disponible'}
            </Text>
          </View>

          <View style={CardHistoryStyles.materialsContainer}>
            <Text style={CardHistoryStyles.materialsLabel}>Materiales:</Text>
            <View style={CardHistoryStyles.materialsRow}>
              {item.type_waste.length > 0
                ? item.type_waste.map((waste) => (
                    <View key={waste.id} style={CardHistoryStyles.materialTag}>
                      <Text style={CardHistoryStyles.materialText}>
                        {waste.type_waste ?? `Tipo ${waste.type_waste_id}`}
                      </Text>
                    </View>
                  ))
                : (
                  <Text style={CardHistoryStyles.materialText}>Sin materiales</Text>
                )}
            </View>
          </View>

          <View style={CardHistoryStyles.metricsRow}>
            <View style={CardHistoryStyles.metricItem}>
              <Icon name="weight-hanging" size={14} color={colors.primary} />
              <Text style={CardHistoryStyles.metricText}>
                {item.type_waste.reduce((s, w) => s + (w.weight ?? 0), 0).toFixed(1)} kg
              </Text>
            </View>
            <View style={CardHistoryStyles.metricItem}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={CardHistoryStyles.metricText}>
                {item.type_waste.reduce((s, w) => s + (w.points ?? 0), 0)} puntos
              </Text>
            </View>
          </View>

          {/* Botón Iniciar Recogida para órdenes asignadas */}
          {isAssignedOrder(item.state?.name ?? '') && (
            <TouchableOpacity
              style={{
                marginTop: 12,
                paddingVertical: 10,
                paddingHorizontal: 16,
                backgroundColor: colors.primary,
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => handleAcceptOrder(item.id)}
              disabled={acceptingOrderId === item.id}
            >
              {acceptingOrderId === item.id ? (
                <ActivityIndicator color={colors.white} size="small" style={{marginRight: 8}} />
              ) : (
                <Icon name="play" size={14} color={colors.white} style={{marginRight: 8}} />
              )}
              <Text style={{color: colors.white, fontWeight: '600', fontSize: 14}}>
                {acceptingOrderId === item.id ? 'Iniciando...' : 'Iniciar recogida'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={CardHistoryStyles.container}>
      {/* Header de estadísticas */}
      <LinearGradient
        style={CardHistoryStyles.statsHeader}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={[colors.primary, '#45A049']}>
        <View style={CardHistoryStyles.statItem}>
          <Icon name="weight" size={20} color={colors.white} />
          <Text style={CardHistoryStyles.statNumber}>{totalWeight.toFixed(1)}</Text>
          <Text style={CardHistoryStyles.statLabel}>kg recolectados</Text>
        </View>
        <View style={CardHistoryStyles.statDivider} />
        <View style={CardHistoryStyles.statItem}>
          <Icon name="star" size={20} color={colors.white} />
          <Text style={CardHistoryStyles.statNumber}>{totalPoints}</Text>
          <Text style={CardHistoryStyles.statLabel}>puntos ganados</Text>
        </View>
        <View style={CardHistoryStyles.statDivider} />
        <View style={CardHistoryStyles.statItem}>
          <Icon name="recycle" size={20} color={colors.white} />
          <Text style={CardHistoryStyles.statNumber}>{completedCollections.length}</Text>
          <Text style={CardHistoryStyles.statLabel}>entregas</Text>
        </View>
      </LinearGradient>

      {/* Lista del historial */}
      <ScrollView style={CardHistoryStyles.historyList} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

