import {Text, View} from 'react-native';
import React, {ReactElement} from 'react';
import {colors} from '../../../utils/constants';
import {PrincipalTextInput} from '../../../components/textInput/PrincipalTextInput';
import ChangePasswordStyles from '../styles.tsx';
import {PrimaryButton} from '../../../components/buttons/PrimaryButton';
import InitViewStyles from '../../InitView/styles';

interface INewPassword {
    values: Partial<{ password: string, password_confirmation: string }>;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
    errors: {
        password?: string;
        password_confirmation?: string;
    };
    touched: {
        password?: boolean;
        password_confirmation?: boolean;
    };
    isLoading: boolean;
    handleSubmit: () => void;
}

/**
 * @component Validate Code
 * @return {ReactElement} - React component
 */
export const NewPassword = ({values, setFieldValue, errors, touched, isLoading, handleSubmit}: INewPassword): ReactElement => {
    return (
        <View>
            <Text style={ChangePasswordStyles.textInfo}>Ahora elige la nueva contraseña</Text>
            <PrincipalTextInput
                value={values.password ?? ''}
                valueChange={'password'}
                change={setFieldValue}
                style={InitViewStyles.textInput}
                label={'Contraseña'}
                mode={'flat'}
                keyboard={'default'}
                security={true}
                error={!!errors?.password && touched?.password}
            />
            <PrincipalTextInput
                value={values.password_confirmation ?? ''}
                valueChange={'password_confirmation'}
                change={setFieldValue}
                style={InitViewStyles.textInput}
                label={'Contraseña'}
                mode={'flat'}
                keyboard={'default'}
                security={true}
                error={!!errors?.password_confirmation && touched?.password_confirmation}
            />
            <View style={ChangePasswordStyles.containerButton}>
                <PrimaryButton
                    text={isLoading ? 'Validando...' : 'Cambiar contraseña'}
                    width={200}
                    height={50}
                    backgroundColor={colors.primary}
                    disabled={isLoading}
                    action={() => handleSubmit()}
                />
            </View>
        </View>
    );
};

