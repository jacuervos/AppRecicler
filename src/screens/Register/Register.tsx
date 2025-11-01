import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
  Pressable,
} from 'react-native';
import * as Yup from 'yup';
import {Formik} from 'formik';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ChangeImage} from '../../components/modals/ChangeImage';
import {PrimaryButton} from '../../components/buttons/PrimaryButton';
import {PrincipalTextInput} from '../../components/textInput/PrincipalTextInput';
import {PrincipalInputSelect} from '../../components/inputSelect/PrincipalInputSelect';
import useTypeIdentificationStore from '../../store/typeIdentificationStore';
import {useAuth} from '../../hooks/useAuth';
import {colors} from '../../utils/constants';
import {openDocument} from '../../functions/Document';
import {openCamera, openGallery} from '../../functions/Camera';
import RegisterStyles from './styles';

type RootStackParamList = {
  Tab: undefined;
};

const Register = ({}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {typeIdentifications, getTypeIdentifications} =
    useTypeIdentificationStore();
  const {isLoading, error, clearError, register } = useAuth();

  const creteSchema = Yup.object().shape({
    email: Yup.string()
      .email('Ingresa un email válido')
      .required('El email es requerido'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('La contraseña es requerida'),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
      .required('La confirmación de contraseña es requerida'),
    name: Yup.string().required('El nombre es requerido'),
    phone: Yup.string().required('El teléfono es requerido'),
    identification: Yup.string().required('La identificación es requerida'),
    type_identification: Yup.string().required(
      'El tipo de identificación es requerido',
    ),
  });

  const [imageProfile, setImageProfile] = useState('');
  const [documentIdentity, setDocumentIdentity] = useState({name: '', url: ''});
  const [documentLicense, setDocumentLicense] = useState({name: '', url: ''});
  const [errorDocuments, setErrorDocuments] = useState({
    image: false,
    identity: false,
    license: false,
  });

  const sheetRef = useRef<BottomSheetModal>(null);

  const handleRegister = async (values: any) => {
    if(!errorDocuments.image && !errorDocuments.identity && !errorDocuments.license){
      const findTypeIdentification = typeIdentifications.find((type) => type.name ===  values.type_identification);
      await register({
        ...values,
        email: values.email.toLowerCase(),
        type_identification: findTypeIdentification !== undefined ? findTypeIdentification.id : 0,
        images: imageProfile,
        identification_document: documentIdentity.url,
        driving_license_document: documentLicense.url,
      });
      navigation.replace('Tab');
      clearError();
    }
  };

  const openModal = () => {
    sheetRef?.current?.present();
  };

  const handleTakeImage = async (image: 'photo' | 'gallery') => {
    if(image === 'photo'){
      const photo = await openCamera();
      setImageProfile(photo?.url ?? '');
    }else {
      const photo = await openGallery();
      setImageProfile(photo?.url ?? '');
    }
    sheetRef?.current?.dismiss();
  };

  const handleUploadDocument = async (type: 'identity' | 'license') => {
    const document = await openDocument();
    if(type === 'identity'){
      setDocumentIdentity({
        name: document?.name ?? 'Documento de Identidad',
        url: document?.url ?? '',
      });
    }else{
      setDocumentLicense({
        name: document?.name ?? 'Licencia de Conducción',
        url: document?.url ?? '',
      });
    }
  };

  const getType = useCallback(async () => {
    await getTypeIdentifications();
  }, [getTypeIdentifications]);

  const listTypeIdentifications = useMemo(() => {
    if (!typeIdentifications) {
      return [];
    }
    return typeIdentifications.map(item => ({
      label: item.name,
      value: item.name,
    }));
  }, [typeIdentifications]);

  useEffect(() => {
    getType();
  }, [getType]);

  return (
    <KeyboardAvoidingView
      style={RegisterStyles.flexContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={RegisterStyles.scrollContainer}>
          <View style={RegisterStyles.container}>
            <LinearGradient
              style={RegisterStyles.gradientStyles}
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              colors={[colors.primary, colors.white]}>
              <View>
                <View style={RegisterStyles.containerImage}>
                  <Image
                      source={imageProfile ? {uri: imageProfile} : require('../../../assets/images/login.png')}
                      style={RegisterStyles.image}
                  />
                </View>
                <Pressable
                    onPress={openModal}
                    style={RegisterStyles.containerCamera}>
                  <MaterialIcons
                      name={'camera-alt'}
                      color={colors.black}
                      size={12}
                  />
                </Pressable>
              </View>
              {errorDocuments.image && (
                  <Text style={RegisterStyles.errorText}>Imagen obligatorio</Text>
              )}
              <View style={RegisterStyles.containerTitle}>
                <Text style={RegisterStyles.firstTitle}>Recycler</Text>
                <Text style={RegisterStyles.secondTitle}>App</Text>
              </View>
            </LinearGradient>
            <Formik
              initialValues={{
                email: '',
                password: '',
                password_confirmation: '',
                name: '',
                phone: '',
                type_identification: '',
                identification: '',
              }}
              validationSchema={creteSchema}
              onSubmit={handleRegister}>
              {({errors, touched, handleSubmit, values, setFieldValue}) => (
                <View>
                  {error && (
                    <View style={RegisterStyles.errorContainer}>
                      <Text style={RegisterStyles.errorText}>{error}</Text>
                    </View>
                  )}
                  <PrincipalTextInput
                    value={values.name}
                    valueChange={'name'}
                    change={setFieldValue}
                    style={RegisterStyles.textInput}
                    label={'Nombre'}
                    mode={'flat'}
                    keyboard={'default'}
                    error={!!errors?.name && touched?.name}
                  />
                  <PrincipalTextInput
                    value={values.phone}
                    valueChange={'phone'}
                    change={setFieldValue}
                    style={RegisterStyles.textInput}
                    label={'Teléfono'}
                    mode={'flat'}
                    keyboard={'numeric'}
                    error={!!errors?.phone && touched?.phone}
                  />
                  <PrincipalInputSelect
                    label={'Seleccionar documento'}
                    value={values.type_identification}
                    valueChange={'type_identification'}
                    change={setFieldValue}
                    options={listTypeIdentifications}
                    style={RegisterStyles.inputSelect}
                    error={
                      !!errors?.type_identification &&
                      touched?.type_identification
                    }
                  />
                  <PrincipalTextInput
                    value={values.identification}
                    valueChange={'identification'}
                    change={setFieldValue}
                    style={RegisterStyles.textInput}
                    label={'Identificación'}
                    mode={'flat'}
                    keyboard={'numeric'}
                    error={!!errors?.identification && touched?.identification}
                  />
                  <PrincipalTextInput
                    value={values.email}
                    valueChange={'email'}
                    change={setFieldValue}
                    style={RegisterStyles.textInput}
                    label={'Correo electrónico'}
                    mode={'flat'}
                    keyboard={'email-address'}
                    error={!!errors?.email && touched?.email}
                  />
                  <PrincipalTextInput
                    value={values.password}
                    valueChange={'password'}
                    change={setFieldValue}
                    style={RegisterStyles.textInput}
                    label={'Contraseña'}
                    mode={'flat'}
                    keyboard={'default'}
                    security={true}
                    error={!!errors?.password && touched?.password}
                  />
                  <PrincipalTextInput
                    value={values.password_confirmation}
                    valueChange={'password_confirmation'}
                    change={setFieldValue}
                    style={RegisterStyles.textInput}
                    label={'Confirmar Contraseña'}
                    mode={'flat'}
                    keyboard={'default'}
                    security={true}
                    error={
                      !!errors?.password_confirmation &&
                      touched?.password_confirmation
                    }
                  />
                  <Pressable style={RegisterStyles.containerDocument}
                    onPress={() => handleUploadDocument('identity')}
                  >
                    <Text style={RegisterStyles.textDocument}>{
                      documentIdentity.name !== '' ? documentIdentity.name : 'Subir Documento de Identidad...'
                    }</Text>
                  </Pressable>
                  {errorDocuments.identity && (
                      <Text style={RegisterStyles.errorTextDocument}>Documento obligatorio</Text>
                  )}
                  <Pressable style={RegisterStyles.containerDocument}
                             onPress={() => handleUploadDocument('license')}
                  >
                    <Text style={RegisterStyles.textDocument}>{
                      documentLicense.name !== '' ? documentLicense.name : 'Subir Licencia de Conducción...'
                    }</Text>
                  </Pressable>
                  {errorDocuments.license && (
                      <Text style={RegisterStyles.errorTextDocument}>Documento obligatorio</Text>
                  )}
                  <View style={RegisterStyles.containerButton}>
                    <PrimaryButton
                      text={isLoading ? 'Iniciando...' : 'Registrarse'}
                      width={150}
                      height={50}
                      backgroundColor={colors.primary}
                      disabled={isLoading}
                      action={() => {
                        console.log(imageProfile === '', 'image');
                        const newErrors = {
                          license: documentLicense.url === '',
                          identity: documentIdentity.url === '',
                          image: imageProfile === '',
                        };
                        setErrorDocuments(newErrors);
                        handleSubmit();
                      }}
                    />
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                      <Text style={RegisterStyles.textHelp}>
                        Iniciar sesión
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      <ChangeImage sheetRef={sheetRef} handleTakeImage={handleTakeImage} />
    </KeyboardAvoidingView>
  );
};

export default Register;
