import React, { useState } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { PrincipalTextInput } from '../../components/textInput/PrincipalTextInput';
import { colors } from '../../utils/constants';
import ResetPasswordStyles from './styles.tsx';
import { ValidatePassword } from '../../functions/ErrorHandling';
import { authApiService } from '../../services/authApiService';

type RootStackParamList = {
  InitView: undefined;
};

type ResetPasswordRouteParams = {
  email: string;
  token: string;
};

const ResetPassword = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { email, token } = route.params as ResetPasswordRouteParams;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPasswordSchema = Yup.object().shape({
    password: ValidatePassword(),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
      .required('La confirmación de contraseña es requerida'),
  });

  const handleResetPassword = async (values: { password: string; password_confirmation: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      // Llamar a la API para cambiar la contraseña
      const response = await authApiService.changePassword({
        email,
        code: token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      if (response === 'Contraseña cambiada ya puede iniciar sesión.') {
        Alert.alert(
          'Contraseña actualizada',
            'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
          [
            {
              text: 'Iniciar sesión',
              onPress: () => navigation.navigate('InitView'),
            },
          ],
        );
      } else {
        setError('Error al cambiar la contraseña');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error?.message || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={ResetPasswordStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header con gradiente */}
          <LinearGradient
            style={ResetPasswordStyles.gradientStyles}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            colors={[colors.primary, colors.lightGreen, colors.secondary]}>
            <View style={ResetPasswordStyles.containerImage}>
              <Image
                source={require('../../../assets/images/login.png')}
                style={ResetPasswordStyles.image}
              />
            </View>
            <View style={ResetPasswordStyles.containerTitle}>
              <Text style={ResetPasswordStyles.firstTitle}>Recycler</Text>
              <Text style={ResetPasswordStyles.secondTitle}>App</Text>
            </View>

            <View style={ResetPasswordStyles.headerTextContainer}>
              <Text style={ResetPasswordStyles.headerTitle}>
                Cambiar contraseña
              </Text>
              <Text style={ResetPasswordStyles.headerSubtitle}>
                Ingresa tu nueva contraseña
              </Text>
            </View>
          </LinearGradient>

          {/* Formulario */}
          <View style={ResetPasswordStyles.formContainer}>
            <Formik
              initialValues={{ password: '', password_confirmation: '' }}
              validationSchema={resetPasswordSchema}
              onSubmit={handleResetPassword}>
              {({ errors, touched, handleSubmit, values, setFieldValue }) => (
                <View>
                  {error && (
                    <View style={ResetPasswordStyles.errorContainer}>
                      <Text style={ResetPasswordStyles.errorText}>{error}</Text>
                    </View>
                  )}

                  <View style={ResetPasswordStyles.emailInfoContainer}>
                    <Icon name="envelope" size={16} color={colors.primary} />
                    <Text style={ResetPasswordStyles.emailInfoText}>
                      Cambiar contraseña para: {email}
                    </Text>
                  </View>

                  <PrincipalTextInput
                    value={values.password}
                    valueChange={'password'}
                    change={setFieldValue}
                    style={ResetPasswordStyles.textInput}
                    label={'Nueva contraseña'}
                    mode={'flat'}
                    keyboard={'default'}
                    security={true}
                    error={!!errors?.password && touched?.password}
                  />

                  <PrincipalTextInput
                    value={values.password_confirmation}
                    valueChange={'password_confirmation'}
                    change={setFieldValue}
                    style={ResetPasswordStyles.textInput}
                    label={'Confirmar nueva contraseña'}
                    mode={'flat'}
                    keyboard={'default'}
                    security={true}
                    error={!!errors?.password_confirmation && touched?.password_confirmation}
                  />

                  <View style={ResetPasswordStyles.containerButton}>
                    <PrimaryButton
                      text={isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                      width={220}
                      height={50}
                      backgroundColor={colors.primary}
                      disabled={isLoading}
                      action={() => handleSubmit()}
                    />
                    <TouchableOpacity onPress={() => navigation.navigate('InitView')}>
                      <Text style={ResetPasswordStyles.textHelp}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ResetPassword;
