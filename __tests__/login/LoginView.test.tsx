import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {Alert, Text, TouchableOpacity} from 'react-native';

// Simular AsyncStorage.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Simular el hook que utiliza InitView.
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Simular navegación.
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Simular el fondo degradado.
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const {View} = require('react-native');

  return ({children}: any) => React.createElement(View, null, children);
});

// Simular el servicio de notificaciones.
jest.mock('../../src/services/pushNotificationService', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(),
    getToken: jest.fn(),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(),
    registerDevice: jest.fn(),
    setupNotifications: jest.fn(),
  },
}));

// Simular campos de texto.
jest.mock('../../src/components/textInput/PrincipalTextInput.tsx', () => {
  const React = require('react');
  const {TextInput} = require('react-native');

  return {
    PrincipalTextInput: ({value, valueChange, change, label}: any) =>
      React.createElement(TextInput, {
        testID: valueChange,
        value,
        placeholder: label,
        onChangeText: (text: string) => change(valueChange, text),
      }),
  };
});

// Simular botón principal.
jest.mock('../../src/components/buttons/PrimaryButton.tsx', () => {
  const React = require('react');
  const {TouchableOpacity, Text} = require('react-native');

  return {
    PrimaryButton: ({text, action, disabled}: any) =>
      React.createElement(
        TouchableOpacity,
        {
          testID: 'login-button',
          disabled,
          onPress: action,
        },
        React.createElement(Text, null, text),
      ),
  };
});

import InitView from '../../src/screens/InitView/InitView';
import {useAuth} from '../../src/hooks/useAuth';
import {useNavigation} from '@react-navigation/native';

describe('InitView', () => {
  const login = jest.fn();
  const clearError = jest.fn();
  const navigate = jest.fn();
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      login,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      clearError,
    });

    (useNavigation as jest.Mock).mockReturnValue({
      navigate,
      replace,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('muestra el indicador de verificación de sesión', () => {
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(<InitView />);
    });

    expect(
      component.root.findByProps({
        children: 'Verificando sesión...',
      }),
    ).toBeTruthy();

    act(() => {
      component.unmount();
    });
  });

  it('redirige a Tab cuando el usuario ya está autenticado', async () => {
    jest.useFakeTimers();

    (useAuth as jest.Mock).mockReturnValue({
      login,
      isLoading: false,
      error: null,
      isAuthenticated: true,
      clearError,
    });

    let component!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      component = TestRenderer.create(<InitView />);
    });

    // Ejecutar el temporizador de inicialización.
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(useAuth).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('Tab');

    act(() => {
      component.unmount();
    });
  });

  it('muestra el formulario cuando el usuario no está autenticado', async () => {
    jest.useFakeTimers();

    let component!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      component = TestRenderer.create(<InitView />);
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(
      component.root.findByProps({
        children: 'Iniciar sesión',
      }),
    ).toBeTruthy();

    expect(
      component.root.findByProps({
        testID: 'email',
      }),
    ).toBeTruthy();

    act(() => {
      component.unmount();
    });
  });

  it('navega a la pantalla de recuperación de contraseña', async () => {
    jest.useFakeTimers();

    let component!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      component = TestRenderer.create(<InitView />);
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    const forgotButton = component.root.find(
      node =>
        node.type === TouchableOpacity &&
        node
          .findAllByType(Text)
          .some(
            textNode => textNode.props.children === '¿Olvidaste tu contraseña?',
          ),
    );

    act(() => {
      forgotButton.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('ForgotPassword');

    act(() => {
      component.unmount();
    });
  });

  it('limpia los errores y llama al login con las credenciales', async () => {
    jest.useFakeTimers();
    login.mockResolvedValueOnce(undefined);

    let component!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      component = TestRenderer.create(<InitView />);
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    const email = component.root.findByProps({testID: 'email'});
    const password = component.root.findByProps({testID: 'password'});

    act(() => {
      email.props.onChangeText('carlos@example.com');
      password.props.onChangeText('secret123');
    });

    await act(async () => {
      component.root.findByProps({testID: 'login-button'}).props.onPress();
    });

    expect(clearError).toHaveBeenCalled();

    expect(login).toHaveBeenCalledWith({
      email: 'carlos@example.com',
      password: 'secret123',
    });

    expect(replace).toHaveBeenCalledWith('Tab');

    act(() => {
      component.unmount();
    });
  });

  it('muestra una alerta si falla el inicio de sesión', async () => {
    jest.useFakeTimers();

    const alertSpy = jest.spyOn(Alert, 'alert');
    login.mockRejectedValueOnce(new Error('Credenciales inválidas'));

    let component!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      component = TestRenderer.create(<InitView />);
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      component.root
        .findByProps({testID: 'email'})
        .props.onChangeText('carlos@example.com');

      component.root
        .findByProps({testID: 'password'})
        .props.onChangeText('secret123');
    });

    await act(async () => {
      component.root.findByProps({testID: 'login-button'}).props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Error de autenticación',
      'Credenciales inválidas',
    );

    alertSpy.mockRestore();

    act(() => {
      component.unmount();
    });
  });


  it('muestra un error genérico cuando el login falla con un error no estándar', async () => {
    jest.useFakeTimers();

    const loginError = jest.fn().mockRejectedValue('error desconocido');
    const clearErrorMock = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert');

    (useAuth as jest.Mock).mockReturnValue({
      login: loginError,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      clearError: clearErrorMock,
    });

    let component!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      component = TestRenderer.create(<InitView />);
    });

    // Esperar a que termine la verificación de sesión.
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Ingresar las credenciales.
    act(() => {
      component.root
        .findByProps({testID: 'email'})
        .props.onChangeText('carlos@example.com');

      component.root
        .findByProps({testID: 'password'})
        .props.onChangeText('secret123');
    });

    // Pulsar el botón de inicio de sesión.
    await act(async () => {
      component.root.findByProps({testID: 'login-button'}).props.onPress();
    });

    expect(clearErrorMock).toHaveBeenCalled();
    expect(loginError).toHaveBeenCalledWith({
      email: 'carlos@example.com',
      password: 'secret123',
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Error de autenticación',
      'Error al iniciar sesión',
    );

    alertSpy.mockRestore();

    act(() => {
      component.unmount();
    });
  });




  it('muestra "Iniciando..." y deshabilita el botón mientras carga', async () => {
    jest.useFakeTimers();

    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: true,
      isAuthenticated: false,
      error: null,
      clearError: jest.fn(),
    });

    let component!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      component = TestRenderer.create(<InitView />);
    });

    // Finalizar la verificación inicial de sesión.
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    const loginButton = component.root.findByProps({
      testID: 'login-button',
    });

    expect(loginButton.props.disabled).toBe(true);

    expect(loginButton.findByType(Text).props.children).toBe('Iniciando...');

    act(() => {
      component.unmount();
    });

    jest.useRealTimers();
  });
});
