import {StyleSheet} from 'react-native';
import {colors, fontFamily} from '../../utils/constants';

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    height: '10%',
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    alignItems:'center',
    flexDirection:'row'
  },
  title: {
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.white,
    fontSize: 20,
  },
  image: {
    width: 40,
    height: 40,
  },
});

export default headerStyles;
