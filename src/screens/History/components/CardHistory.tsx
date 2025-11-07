import {StyleSheet, View, Text, ScrollView, TouchableOpacity} from 'react-native';
import React, {ReactElement, useState, useEffect} from 'react';
import CardHistoryStyles from './styles';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {colors, fontFamily} from '../../../utils/constants';
import LinearGradient from 'react-native-linear-gradient';

// Tipo para un item del historial
interface HistoryItem {
  id: string;
  date: string;
  time: string;
  location: string;
  materials: string[];
  weight: number;
  points: number;
  status: 'completed' | 'pending' | 'cancelled';
}

// Datos de ejemplo (en una app real, estos vendrían de un servicio)
const mockHistoryData: HistoryItem[] = [
  {
    id: '1',
    date: '2024-10-28',
    time: '14:30',
    location: 'Centro de Reciclaje Norte',
    materials: ['Plástico', 'Papel', 'Vidrio'],
    weight: 5.2,
    points: 52,
    status: 'completed'
  },
  {
    id: '2',
    date: '2024-10-26',
    time: '09:15',
    location: 'Punto Verde Plaza Central',
    materials: ['Metal', 'Cartón'],
    weight: 3.8,
    points: 38,
    status: 'completed'
  },
  {
    id: '3',
    date: '2024-10-25',
    time: '16:45',
    location: 'EcoEstación Sur',
    materials: ['Plástico', 'Electrónicos'],
    weight: 2.1,
    points: 25,
    status: 'pending'
  },
  {
    id: '4',
    date: '2024-10-23',
    time: '11:20',
    location: 'Centro de Reciclaje Norte',
    materials: ['Papel', 'Vidrio', 'Metal'],
    weight: 7.5,
    points: 75,
    status: 'completed'
  }
];

/**
 * @component Card History
 * @return {ReactElement} - React component
 */
export const CardHistory = (): ReactElement => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');

  useEffect(() => {
    // Simular carga de datos
    setHistoryData(mockHistoryData);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.primary;
      case 'pending':
        return '#FFA500';
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'clock';
      case 'cancelled':
        return 'times-circle';
      default:
        return 'question-circle';
    }
  };

  const filteredData = historyData.filter(item =>
    selectedFilter === 'all' || item.status === selectedFilter
  );

  const totalWeight = historyData
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => sum + item.weight, 0);

  const totalPoints = historyData
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => sum + item.points, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
          <Text style={CardHistoryStyles.statLabel}>kg reciclados</Text>
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
          <Text style={CardHistoryStyles.statNumber}>{historyData.filter(item => item.status === 'completed').length}</Text>
          <Text style={CardHistoryStyles.statLabel}>entregas</Text>
        </View>
      </LinearGradient>

      {/* Filtros */}
      <View style={CardHistoryStyles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Todos', icon: 'list' },
            { key: 'completed', label: 'Completados', icon: 'check-circle' },
            { key: 'pending', label: 'Pendientes', icon: 'clock' },
            { key: 'cancelled', label: 'Cancelados', icon: 'times-circle' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                CardHistoryStyles.filterButton,
                selectedFilter === filter.key && CardHistoryStyles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}>
              <Icon
                name={filter.icon}
                size={14}
                color={selectedFilter === filter.key ? colors.white : colors.primary}
              />
              <Text style={[
                CardHistoryStyles.filterText,
                selectedFilter === filter.key && CardHistoryStyles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista del historial */}
      <ScrollView style={CardHistoryStyles.historyList} showsVerticalScrollIndicator={false}>
        {filteredData.length === 0 ? (
          <View style={CardHistoryStyles.emptyContainer}>
            <Icon name="leaf" size={50} color={colors.gray} />
            <Text style={CardHistoryStyles.emptyText}>No hay registros para mostrar</Text>
            <Text style={CardHistoryStyles.emptySubtext}>
              {selectedFilter === 'all'
                ? 'Comienza a reciclar para ver tu historial'
                : `No tienes entregas ${getStatusText(selectedFilter).toLowerCase()}`
              }
            </Text>
          </View>
        ) : (
          filteredData.map((item) => (
            <TouchableOpacity key={item.id} style={CardHistoryStyles.historyCard}>
              <View style={CardHistoryStyles.cardHeader}>
                <View style={CardHistoryStyles.dateContainer}>
                  <Icon name="calendar-alt" size={16} color={colors.primary} />
                  <Text style={CardHistoryStyles.dateText}>
                    {formatDate(item.date)} • {item.time}
                  </Text>
                </View>
                <View style={[CardHistoryStyles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Icon name={getStatusIcon(item.status)} size={12} color={colors.white} />
                  <Text style={CardHistoryStyles.statusText}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>

              <View style={CardHistoryStyles.cardContent}>
                <View style={CardHistoryStyles.locationRow}>
                  <Icon name="map-marker-alt" size={14} color={colors.gray} />
                  <Text style={CardHistoryStyles.locationText}>{item.location}</Text>
                </View>

                <View style={CardHistoryStyles.materialsContainer}>
                  <Text style={CardHistoryStyles.materialsLabel}>Materiales:</Text>
                  <View style={CardHistoryStyles.materialsRow}>
                    {item.materials.map((material, index) => (
                      <View key={index} style={CardHistoryStyles.materialTag}>
                        <Text style={CardHistoryStyles.materialText}>{material}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={CardHistoryStyles.metricsRow}>
                  <View style={CardHistoryStyles.metricItem}>
                    <Icon name="weight-hanging" size={14} color={colors.primary} />
                    <Text style={CardHistoryStyles.metricText}>{item.weight} kg</Text>
                  </View>
                  <View style={CardHistoryStyles.metricItem}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={CardHistoryStyles.metricText}>{item.points} puntos</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

