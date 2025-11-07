import {Text, View} from 'react-native';
import React, {ReactElement} from 'react';
import {colors} from '../../../utils/constants';
import {PrimaryButton} from '../../../components/buttons/PrimaryButton';
import {PrincipalTextInput} from '../../../components/textInput/PrincipalTextInput';
import ChangePasswordStyles from '../styles';

interface IValidateCode {
  values: Partial<{ code: string }>;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  errors: Partial<{ code: string }>;
  touched: Partial<{ code: boolean }>;
  isLoading: boolean;
  handleSubmit: () => void;
}
/**
 * @component Validate Code
 * @return {ReactElement} - React component
 */
export const ValidateCode = ({values, setFieldValue, errors, touched, isLoading, handleSubmit}: IValidateCode): ReactElement => {
  return (
    <View>
      <Text style={ChangePasswordStyles.textInfo}>El código fue enviado al correo</Text>
      <PrincipalTextInput
          value={values.code ?? ''}
          valueChange={'code'}
          change={setFieldValue}
          style={ChangePasswordStyles.textInput}
          label={'Código'}
          mode={'flat'}
          keyboard={'numeric'}
          error={!!errors?.code && touched?.code}
      />
      <View style={ChangePasswordStyles.containerButton}>
        <PrimaryButton
            text={isLoading ? 'Validando...' : 'Validar código'}
            width={150}
            height={50}
            backgroundColor={colors.primary}
            disabled={isLoading}
            action={() => handleSubmit()}
        />
      </View>
    </View>
  );
};

