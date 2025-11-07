import React, { useState } from 'react';
import {Text, View, Image, Alert} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ValidateCode} from './components/ValidateCode';
import {NewPassword} from './components/NewPassword';
import {useAuth} from '../../hooks/useAuth';
import {colors} from '../../utils/constants';
import ChangePasswordStyles from './styles';


type RootStackParamList = {
  InitView: undefined;
};

type CodeValues = { code: string };
type ChangeValues = { password: string, password_confirmation: string };

const ChangePassword = ({route}: any) => {

  const {email} = route.params;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { validateCode, changePassword, isLoading, error, clearError } = useAuth();

  const [screen, setScreen] = useState('validate');
  const [saveCode, setSaveCode] = useState('');

  const creteSchema = Yup.object().shape({
    code: Yup.string()
      .required('El código es requerido'),
  });

  const creteSchemaPassword = Yup.object().shape({
    password: Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .required('La contraseña es requerida'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
        .required('La confirmación de contraseña es requerida'),
  });

  const handleForgot = (values: CodeValues | ChangeValues ) => {
    if (screen === 'validate') {
      const val = values as CodeValues;
      handleValidate(val.code);
    }else {
      const val = values as ChangeValues;
      handleChangePassword(val.password, val.password_confirmation);
    }
  };

  const handleValidate = async (code: string) => {
    try {
      clearError();
      await validateCode(code);
      setSaveCode(code);
      setScreen('changePassword');
    } catch (err) {
      Alert.alert(
          'Error de validación',
          err instanceof Error ? err?.message : 'Error de servidor',
      );
    }
  };

  const handleChangePassword = async (password: string, passwordConfirmation: string) => {
    console.log('entra aca no?');
    try {
      clearError();
      let values = {
        code: saveCode,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      };
      console.log(values, 'aca');
      await changePassword(values);
      setSaveCode('');
      setScreen('validate');
      navigation.replace('InitView');
    } catch (err) {
      Alert.alert(
          'Error de validación',
          err instanceof Error ? err?.message : 'Error de servidor',
      );
    }
  };

  return (
    <View style={ChangePasswordStyles.container}>
      <LinearGradient
        style={ChangePasswordStyles.gradientStyles}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        colors={[colors.primary, colors.white]}>
        <View style={ChangePasswordStyles.containerImage}>
          <Image
            source={require('../../../assets/images/login.png')}
            style={ChangePasswordStyles.image}
          />
        </View>
        <View style={ChangePasswordStyles.containerTitle}>
          <Text style={ChangePasswordStyles.firstTitle}>Cambiar contraseña</Text>
        </View>
      </LinearGradient>
      <Formik
        initialValues={screen === 'validate' ? {code: ''} : {password: '', password_confirmation: ''}}
        validationSchema={screen === 'validate' ? creteSchema : creteSchemaPassword}
        onSubmit={handleForgot}>
        {({errors, touched, handleSubmit, values, setFieldValue}) => (
          <View>
            {error && (
              <View style={ChangePasswordStyles.errorContainer}>
                <Text style={ChangePasswordStyles.errorText}>{error}</Text>
              </View>
            )}
            {screen === 'validate' && (
                <ValidateCode
                    values={values}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    touched={touched}
                    isLoading={isLoading}
                    handleSubmit={handleSubmit}
                />
            )}
            {screen === 'changePassword' && (
                <NewPassword
                    values={values}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    touched={touched}
                    isLoading={isLoading}
                    handleSubmit={handleSubmit}
                />
            )}
          </View>
        )}
      </Formik>
    </View>
  );
};

export default ChangePassword;
