import {StyleSheet} from 'react-native';
import { colors, fontFamily } from '../../utils/constants';

const buttonsStyles = StyleSheet.create({
  containerPrimary: {
    borderRadius: 8,
    justifyContent:'center'
  },
  textButtonPrimary: {
    textAlign: 'center',
    color: colors.white,
    fontSize:18,
    fontFamily: fontFamily.fontFamilyBold
  },
});

export default buttonsStyles;