import React from 'react';
import {Text, View, Image} from 'react-native';
import {PrincipalTextInput} from '../../components/textInput/PrincipalTextInput.tsx';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import InitViewStyles from './styles.tsx';
import {colors} from '../../utils/constants.tsx';
import {PrimaryButton} from '../../components/buttons/PrimaryButton.tsx';
import {
  ValidatePhone,
  ValidateDocument,
} from '../../functions/ErrorHandling.tsx';
import LinearGradient from 'react-native-linear-gradient';

type RootStackParamList = {
  Tab: undefined;
};

const InitView = ({}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const creteSchema = Yup.object().shape({
    phone: ValidatePhone(),
    document: ValidateDocument(),
  });

  return (
    <View style={InitViewStyles.container}>
      <LinearGradient
        style={InitViewStyles.gradientStyles}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        colors={[colors.primary, colors.white]}>
        <View style={InitViewStyles.containerImage}>
          <Image
            source={require('../../../assets/images/login.png')}
            style={InitViewStyles.image}
          />
        </View>
        <View style={InitViewStyles.containerTitle}>
          <Text style={InitViewStyles.firstTitle}>Recycler</Text>
          <Text style={InitViewStyles.secondTitle}>App</Text>
        </View>
      </LinearGradient>
      <Formik
        initialValues={{phone: '', document: ''}}
        validationSchema={creteSchema}
        onSubmit={values => console.log(values)}>
        {({errors, touched, handleSubmit, values, setFieldValue}) => (
          <View>
            <PrincipalTextInput
              value={values.phone}
              valueChange={'phone'}
              change={setFieldValue}
              style={InitViewStyles.textInput}
              label={'Teléfono'}
              mode={'flat'}
              keyboard={'numeric'}
              error={!!errors?.phone && touched?.phone}
            />
            <PrincipalTextInput
              value={values.document}
              valueChange={'document'}
              change={setFieldValue}
              style={InitViewStyles.textInput}
              label={'Documento'}
              mode={'flat'}
              keyboard={'numeric'}
              error={!!errors?.password && touched?.password}
            />
            <View style={InitViewStyles.containerButton}>
              <PrimaryButton
                text={'Iniciar sesión'}
                width={150}
                height={50}
                backgroundColor={colors.primary}
                disabled={false}
                action={() => navigation.navigate('Tab')}
              />
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
};

export default InitView;
