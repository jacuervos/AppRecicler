import {StyleSheet} from 'react-native';
import {colors, fontFamily} from '../../../utils/constants';

const CardHistoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header de estadísticas
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: fontFamily.fontFamilyBold,
    color: colors.white,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
  },
  statDivider: {
    height: 40,
    width: 1,
    backgroundColor: colors.white,
    opacity: 0.3,
  },

  // Filtros
  filtersContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontFamily: fontFamily.fontFamilySemiBold,
    color: colors.primary,
    marginLeft: 5,
  },
  filterTextActive: {
    color: colors.white,
  },

  // Lista del historial
  historyList: {
    flex: 1,
    paddingHorizontal: 15,
  },

  // Estado vacío
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fontFamily.fontFamilySemiBold,
    color: colors.gray,
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.gray,
    marginTop: 5,
    textAlign: 'center',
    opacity: 0.8,
  },

  // Card del historial
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.text,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fontFamily.fontFamilySemiBold,
    color: colors.white,
    marginLeft: 4,
  },

  // Contenido de la card
  cardContent: {
    padding: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  materialsContainer: {
    marginBottom: 12,
  },
  materialsLabel: {
    fontSize: 14,
    fontFamily: fontFamily.fontFamilySemiBold,
    color: colors.text,
    marginBottom: 6,
  },
  materialsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  materialTag: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  materialText: {
    fontSize: 12,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.primary,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 14,
    fontFamily: fontFamily.fontFamilySemiBold,
    color: colors.text,
    marginLeft: 6,
  },
});

export default CardHistoryStyles;