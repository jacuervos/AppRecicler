/*!
 * Copyright (c) Laika LLC. All rights reserved.
 */

import {View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import React, {ReactElement, useEffect} from 'react';
import CardHistoryStyles from './styles';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {colors} from '../../../utils/constants';
import LinearGradient from 'react-native-linear-gradient';
import useOrderStore from '../../../store/orderStore';
import {OrderHistoryItem} from '../../../types/order.types';

/**
 * @component Card History
 * @return {ReactElement} - React component
 */
export const CardHistory = (): ReactElement => {
  const { myCollections, loading, error, fetchMyCollections } = useOrderStore();

  useEffect(() => {
    fetchMyCollections();
  }, [fetchMyCollections]);

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

  const completedCollections = myCollections.filter(item => {
    const name = item.state?.name?.toLowerCase() ?? '';
    return name.includes('complet') || name.includes('finaliz');
  });

  const totalWeight = completedCollections.reduce(
    (sum, item) => sum + item.type_waste.reduce((s, w) => s + (w.weight ?? 0), 0),
    0,
  );

  const handleManualRefresh = async () => {
    try {
      await fetchMyCollections();
    } catch (error_) {
      Alert.alert('Error', 'No se pudo actualizar el historial');
      console.error('Error refreshing history:', error_);
    }
  };

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
      <TouchableOpacity key={item.id} style={CardHistoryStyles.historyCard}>
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
                        {waste.name || waste.type_waste || `Material #${waste.type_waste_id}`}
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
          </View>
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
          <Icon name="recycle" size={20} color={colors.white} />
          <Text style={CardHistoryStyles.statNumber}>{completedCollections.length}</Text>
          <Text style={CardHistoryStyles.statLabel}>entregas</Text>
        </View>
      </LinearGradient>

      <TouchableOpacity
        style={CardHistoryStyles.refreshButton}
        onPress={handleManualRefresh}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <>
            <Icon name="sync-alt" size={14} color={colors.white} />
            <Text style={CardHistoryStyles.refreshButtonText}>Actualizar historial</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Lista del historial */}
      <ScrollView style={CardHistoryStyles.historyList} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

