import {StyleSheet} from 'react-native';
import {colors, fontFamily} from '../../utils/constants.tsx';

const RegisterStyles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  containerCamera: {
    backgroundColor: colors.white,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
    position: 'absolute',
    top: '57%',
    right: '-3%',
  },
  containerImage: {
    backgroundColor: colors.white,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  containerTitle: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  firstTitle: {
    color: colors.primary,
    fontSize: 25,
    fontFamily: fontFamily.fontFamilyBold,
  },
  secondTitle: {
    color: colors.black,
    fontSize: 25,
    fontFamily: fontFamily.fontFamilyBold,
  },
  textInput: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: colors.secondary,
    marginTop: '5%',
    fontFamily: fontFamily.fontFamilyRegular,
  },
  inputSelect: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: colors.secondary,
    marginTop: '5%',
    height: '7%',
    paddingHorizontal: 10,
  },
  containerButton: {
    marginTop: '15%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  containerDocument: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginTop: 25,
    padding: 10,
    width: '90%',
  },
  gradientStyles: {
    height: '20%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  textHelp: {
    fontFamily: fontFamily.fontFamilyRegular,
    textDecorationLine: 'underline',
    marginTop: 10,
    marginBottom: 150,
    fontSize: 15,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    margin: 15,
    alignSelf: 'center',
    width: '90%',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontFamily: fontFamily.fontFamilyRegular,
    textAlign: 'center',
  },
  errorTextDocument: {
    color: colors.error,
    fontSize: 14,
    fontFamily: fontFamily.fontFamilyRegular,
    marginLeft: 20,
    marginTop: 5,
  },
  textDocument: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.fontFamilyRegular,
  },
});

export default RegisterStyles;
