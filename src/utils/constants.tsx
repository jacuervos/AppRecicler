export const colors = {
  primary: '#51B055',
  secondary: '#f3f9f3',
  text: '#383838',
  error: '#ff7474',
  white: '#FFFFFF',
  black: '#17202a',
  gray: '#B2B2B2',
  lightGray: '#F5F5F5',
  // Verde suave para botones secundarios
  lightGreen: '#81C784',
  // Verde agua para elementos interactivos
  tertiary: '#4CAF50',
  // Fondo principal con tinte verde muy sutil
  background: '#FAFFFE',
};

// Estilos reutilizables para sombras
export const shadows = {
  small: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  large: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
};

// Radios de borde comunes
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xl: 20,
  round: 50,
};

export const fontFamily = {
    fontFamilyBlack:'Nunito-Black',
    fontFamilyBlackItalic:'Nunito-BlackItalic',
    fontFamilyBold:'Nunito-Bold',
    fontFamilyBoldItalic:'Nunito-BoldItalic',
    fontFamilyItalic:'Nunito-Italic',
    fontFamilyLight:'Nunito-Light',
    fontFamilyLightItalic:'Nunito-LightItalic',
    fontFamilyRegular:'Nunito-Regular',
    fontFamilySemiBold:'Nunito-SemiBold',
    fontFamilySemiBoldItalic:'Nunito-SemiBoldItalic',
};
