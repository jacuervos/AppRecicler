import { StyleSheet } from 'react-native';
import { colors, fontFamily, shadows, borderRadius } from '../../utils/constants';

const ResetPasswordStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientStyles: {
    minHeight: '40%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  containerImage: {
    backgroundColor: colors.white,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.round,
    ...shadows.large,
    borderWidth: 2,
    borderColor: colors.lightGreen,
    marginBottom: 15,
  },
  image: {
    width: 80,
    height: 80,
  },
  containerTitle: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  firstTitle: {
    color: colors.white,
    fontSize: 28,
    fontFamily: fontFamily.fontFamilyBold,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  secondTitle: {
    color: colors.white,
    fontSize: 28,
    fontFamily: fontFamily.fontFamilyBold,
    opacity: 0.9,
  },
  headerTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontFamily: fontFamily.fontFamilyBold,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.fontFamilyRegular,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingTop: 30,
  },
  textInput: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: colors.secondary,
    marginTop: 20,
    fontFamily: fontFamily.fontFamilyRegular,
    borderRadius: borderRadius.medium,
    borderTopLeftRadius: borderRadius.medium,
    borderTopRightRadius: borderRadius.medium,
  },
  containerButton: {
    marginTop: 30,
    alignSelf: 'center',
    alignItems: 'center',
  },
  textHelp: {
    fontFamily: fontFamily.fontFamilyRegular,
    textDecorationLine: 'underline',
    marginTop: 15,
    fontSize: 15,
    color: colors.tertiary,
  },
  errorContainer: {
    backgroundColor: colors.lightGray,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: borderRadius.small,
    padding: 12,
    margin: 15,
    alignSelf: 'center',
    width: '90%',
    ...shadows.small,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontFamily: fontFamily.fontFamilySemiBold,
    textAlign: 'center',
  },
  emailInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    padding: 12,
    margin: 15,
    borderRadius: borderRadius.medium,
    ...shadows.small,
  },
  emailInfoText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: fontFamily.fontFamilyRegular,
    color: colors.primary,
  },
});

export default ResetPasswordStyles;
