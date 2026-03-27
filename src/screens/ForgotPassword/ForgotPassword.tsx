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
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { PrincipalTextInput } from '../../components/textInput/PrincipalTextInput';
import { colors } from '../../utils/constants';
import ForgotPasswordStyles from './styles.tsx';
import { ValidateToken } from '../../functions/ErrorHandling';
import { authApiService } from '../../services/authApiService';

type RootStackParamList = {
  InitView: undefined;
  ResetPassword: { email: string; token: string };
};

const ForgotPassword = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [step, setStep] = useState<'email' | 'token'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailSchema = Yup.object().shape({
    email: Yup.string()
      .email('Ingresa un email válido')
      .required('El email es requerido'),
  });

  const tokenSchema = Yup.object().shape({
    token: ValidateToken(),
  });

  const handleSendResetEmail = async (values: { email: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      // Llamar a la API para enviar el email de recuperación
      const response = await authApiService.forgotPassword({ email: values.email });
      if (response.success) {
        setEmail(values.email);
        setStep('token');
        Alert.alert(
          'Email enviado',
          response.message || `Se ha enviado un código de verificación a ${values.email}`,
          [{ text: 'OK' }]
        );
      } else {
        setError(response.message || 'Error al enviar el email de recuperación');
      }
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      setError(error?.message || 'Error al enviar el email de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateToken = async (values: { token: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      // Validar el token con la API
      const response = await authApiService.validateCode(values.token);

      if (response === 'Código valido, ahora cambia la contraseña') {
        navigation.navigate('ResetPassword', {email, token: values.token});
      } else {
        setError('Código de verificación inválido');
      }
    } catch (error: any) {
      setError(error?.message || 'Código de verificación inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApiService.forgotPassword({ email });
      if (response.success) {
        Alert.alert(
          'Código reenviado',
          response.message || 'Se ha reenviado el código de verificación',
          [{ text: 'OK' }]
        );
      } else {
        setError(response.message || 'Error al reenviar el código');
      }
    } catch (error: any) {
      setError(error?.message || 'Error al reenviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={ForgotPasswordStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header con gradiente */}
          <LinearGradient
            style={ForgotPasswordStyles.gradientStyles}
            start={{x: 0.5, y: 0}}
            end={{x: 0.5, y: 1}}
            colors={[colors.primary, colors.lightGreen, colors.secondary]}>
            {/* Botón de regreso */}
            <TouchableOpacity
              style={ForgotPasswordStyles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={20} color={colors.white} />
            </TouchableOpacity>

            <View style={ForgotPasswordStyles.containerImage}>
              <Image
                source={require('../../../assets/images/login.png')}
                style={ForgotPasswordStyles.image}
              />
            </View>
            <View style={ForgotPasswordStyles.containerTitle}>
              <Text style={ForgotPasswordStyles.firstTitle}>Recycler</Text>
              <Text style={ForgotPasswordStyles.secondTitle}>App</Text>
            </View>

            <View style={ForgotPasswordStyles.headerTextContainer}>
              <Text style={ForgotPasswordStyles.headerTitle}>
                {step === 'email' ? 'Recuperar contraseña' : 'Validar código'}
              </Text>
              <Text style={ForgotPasswordStyles.headerSubtitle}>
                {step === 'email'
                  ? 'Ingresa tu email para recibir un código de verificación'
                  : 'Ingresa el código de 6 dígitos que enviamos a tu email'}
              </Text>
            </View>
          </LinearGradient>

          {/* Formulario */}
          <View style={ForgotPasswordStyles.formContainer}>
            {step === 'email' ? (
              <Formik
                initialValues={{email: ''}}
                validationSchema={emailSchema}
                onSubmit={handleSendResetEmail}>
                {({errors, touched, handleSubmit, values, setFieldValue}) => (
                  <View>
                    {error && (
                      <View style={ForgotPasswordStyles.errorContainer}>
                        <Text style={ForgotPasswordStyles.errorText}>
                          {error}
                        </Text>
                      </View>
                    )}

                    <PrincipalTextInput
                      value={values.email}
                      valueChange={'email'}
                      change={setFieldValue}
                      style={ForgotPasswordStyles.textInput}
                      label={'Correo electrónico'}
                      mode={'flat'}
                      keyboard={'email-address'}
                      error={!!errors?.email && touched?.email}
                    />

                    <View style={ForgotPasswordStyles.containerButton}>
                      <PrimaryButton
                        text={isLoading ? 'Enviando...' : 'Enviar código'}
                        width={200}
                        height={50}
                        backgroundColor={colors.primary}
                        disabled={isLoading}
                        action={() => handleSubmit()}
                      />
                      <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={ForgotPasswordStyles.textHelp}>
                          Volver al inicio de sesión
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Formik>
            ) : (
              <Formik
                initialValues={{token: ''}}
                validationSchema={tokenSchema}
                onSubmit={handleValidateToken}>
                {({errors, touched, handleSubmit, values, setFieldValue}) => (
                  <View>
                    {error && (
                      <View style={ForgotPasswordStyles.errorContainer}>
                        <Text style={ForgotPasswordStyles.errorText}>
                          {error}
                        </Text>
                      </View>
                    )}

                    <View style={ForgotPasswordStyles.emailInfoContainer}>
                      <Icon name="envelope" size={16} color={colors.primary} />
                      <Text style={ForgotPasswordStyles.emailInfoText}>
                        Código enviado a: {email}
                      </Text>
                    </View>

                    <PrincipalTextInput
                      value={values.token}
                      valueChange={'token'}
                      change={setFieldValue}
                      style={ForgotPasswordStyles.textInput}
                      label={'Código de verificación'}
                      mode={'flat'}
                      keyboard={'numeric'}
                      error={!!errors?.token && touched?.token}
                    />

                    <View style={ForgotPasswordStyles.containerButton}>
                      <PrimaryButton
                        text={isLoading ? 'Validando...' : 'Validar código'}
                        width={200}
                        height={50}
                        backgroundColor={colors.primary}
                        disabled={isLoading}
                        action={() => handleSubmit()}
                      />

                      <TouchableOpacity
                        onPress={handleResendCode}
                        disabled={isLoading}>
                        <Text
                          style={[
                            ForgotPasswordStyles.textHelp,
                            isLoading && {opacity: 0.5},
                          ]}>
                          Reenviar código
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setStep('email')}>
                        <Text style={ForgotPasswordStyles.textHelp}>
                          Cambiar email
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Formik>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;
