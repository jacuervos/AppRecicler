import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {
  Text,
  TouchableOpacity,
  Pressable,
} from 'react-native';

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: jest.fn(),
}));

jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/store/typeIdentificationStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    __esModule: true,
    default: ({children}: any) =>
      React.createElement(View, null, children),
  };
});

jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  const {Text} = require('react-native');

  return ({name}: any) =>
    React.createElement(Text, null, name);
});

jest.mock('../../src/components/textInput/PrincipalTextInput.tsx', () => {
  const React = require('react');
  const {TextInput} = require('react-native');

  return {
    PrincipalTextInput: ({
                           value,
                           valueChange,
                           change,
                           label,
                         }: any) =>
      React.createElement(TextInput, {
        testID: valueChange,
        value,
        placeholder: label,
        onChangeText: (text: string) => change(valueChange, text),
      }),
  };
});

jest.mock('../../src/components/inputSelect/PrincipalInputSelect.tsx', () => {
  const React = require('react');
  const {TouchableOpacity, Text} = require('react-native');

  return {
    PrincipalInputSelect: ({
                             value,
                             valueChange,
                             change,
                             options,
                             label,
                           }: any) =>
      React.createElement(
        TouchableOpacity,
        {
          testID: 'select-type-identification',
          onPress: () =>
            change(valueChange, options[0]?.value ?? ''),
        },
        React.createElement(Text, null, value || label),
      ),
  };
});

jest.mock('../../src/components/buttons/PrimaryButton.tsx', () => {
  const React = require('react');
  const {TouchableOpacity, Text} = require('react-native');

  return {
    PrimaryButton: ({text, action, disabled}: any) =>
      React.createElement(
        TouchableOpacity,
        {
          testID: 'register-button',
          disabled,
          onPress: action,
        },
        React.createElement(Text, null, text),
      ),
  };
});

jest.mock('../../src/components/modals/ChangeImage', () => {
  const React = require('react');
  const {View, TouchableOpacity, Text} = require('react-native');

  return {
    ChangeImage: ({handleTakeImage}: any) =>
      React.createElement(
        View,
        null,
        React.createElement(
          TouchableOpacity,
          {
            testID: 'take-photo',
            onPress: () => handleTakeImage('photo'),
          },
          React.createElement(Text, null, 'Tomar foto'),
        ),
        React.createElement(
          TouchableOpacity,
          {
            testID: 'open-gallery',
            onPress: () => handleTakeImage('gallery'),
          },
          React.createElement(Text, null, 'Abrir galería'),
        ),
      ),
  };
});

jest.mock('../../src/functions/Document', () => ({
  openDocument: jest.fn(),
}));

jest.mock('../../src/functions/Camera', () => ({
  openCamera: jest.fn(),
  openGallery: jest.fn(),
}));

import Register from '../../src/screens/Register/Register';
import {useAuth} from '../../src/hooks/useAuth';
import useTypeIdentificationStore from '../../src/store/typeIdentificationStore';
import {useNavigation} from '@react-navigation/native';
import {openDocument} from '../../src/functions/Document';
import {openCamera, openGallery} from '../../src/functions/Camera';

describe('Register', () => {
  const registerMock = jest.fn();
  const clearErrorMock = jest.fn();
  const getTypeIdentificationsMock = jest.fn();
  const replaceMock = jest.fn();
  const goBackMock = jest.fn();

  const typeIdentificationsMock = [
    {id: 1, name: 'Cédula'},
    {id: 2, name: 'Pasaporte'},
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    registerMock.mockResolvedValue(undefined);
    getTypeIdentificationsMock.mockResolvedValue(undefined);

    (useAuth as jest.Mock).mockReturnValue({
      register: registerMock,
      isLoading: false,
      error: null,
      clearError: clearErrorMock,
    });

    (useTypeIdentificationStore as jest.Mock).mockReturnValue({
      typeIdentifications: typeIdentificationsMock,
      getTypeIdentifications: getTypeIdentificationsMock,
    });

    (useNavigation as jest.Mock).mockReturnValue({
      replace: replaceMock,
      goBack: goBackMock,
    });

    (openCamera as jest.Mock).mockResolvedValue({
      url: 'https://example.com/profile.jpg',
    });

    (openGallery as jest.Mock).mockResolvedValue({
      url: 'https://example.com/gallery.jpg',
    });

    (openDocument as jest.Mock).mockResolvedValue({
      name: 'documento.pdf',
      url: 'https://example.com/documento.pdf',
    });
  });

  const renderRegister = async () => {
    let component!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      component = TestRenderer.create(<Register />);
    });

    return component;
  };

  const fillForm = async (
    component: TestRenderer.ReactTestRenderer,
  ) => {
    const fields = [
      ['name', 'Carlos Pérez'],
      ['phone', '3001234567'],
      ['identification', '123456789'],
      ['email', 'CARLOS@EXAMPLE.COM'],
      ['password', 'secret123'],
      ['password_confirmation', 'secret123'],
    ] as const;

    await act(async () => {
      for (const [field, value] of fields) {
        component.root
          .findByProps({testID: field})
          .props.onChangeText(value);
      }

      component.root
        .findByProps({testID: 'select-type-identification'})
        .props.onPress();
    });
  };

  const uploadRequiredFiles = async (
    component: TestRenderer.ReactTestRenderer,
  ) => {
    await act(async () => {
      component.root.findByProps({testID: 'take-photo'}).props.onPress();
    });

    const identityButton = component.root
      .findAllByType(Pressable)
      .find(node =>
        node
          .findAllByType(Text)
          .some(
            textNode =>
              textNode.props.children ===
              'Subir Documento de Identidad...',
          ),
      );

    expect(identityButton).toBeDefined();

    await act(async () => {
      identityButton!.props.onPress();
    });

    const licenseButton = component.root
      .findAllByType(Pressable)
      .find(node =>
        node
          .findAllByType(Text)
          .some(
            textNode =>
              textNode.props.children ===
              'Subir Licencia de Conducción...',
          ),
      );

    expect(licenseButton).toBeDefined();

    await act(async () => {
      licenseButton!.props.onPress();
    });
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  it('muestra el formulario de registro', async () => {
    const component = await renderRegister();

    expect(
      component.root.findByProps({testID: 'name'}),
    ).toBeTruthy();

    expect(
      component.root.findByProps({testID: 'email'}),
    ).toBeTruthy();

    expect(
      component.root.findByProps({testID: 'password'}),
    ).toBeTruthy();

    expect(
      component.root.findByProps({
        testID: 'password_confirmation',
      }),
    ).toBeTruthy();

    expect(
      component.root.findByProps({testID: 'register-button'}),
    ).toBeTruthy();

    act(() => {
      component.unmount();
    });
  });

  it('consulta los tipos de identificación al abrir la vista', async () => {
    const component = await renderRegister();

    expect(getTypeIdentificationsMock).toHaveBeenCalled();

    act(() => {
      component.unmount();
    });
  });

  it('vuelve a la pantalla anterior al pulsar Iniciar sesión', async () => {
    const component = await renderRegister();

    const loginLink = component.root
      .findAllByType(TouchableOpacity)
      .find(node =>
        node
          .findAllByType(Text)
          .some(
            textNode =>
              textNode.props.children === 'Iniciar sesión',
          ),
      );

    expect(loginLink).toBeDefined();

    act(() => {
      loginLink!.props.onPress();
    });

    expect(goBackMock).toHaveBeenCalled();

    act(() => {
      component.unmount();
    });
  });

  it('muestra los errores de imagen y documentos obligatorios', async () => {
    const component = await renderRegister();

    await act(async () => {
      component.root
        .findByProps({testID: 'register-button'})
        .props.onPress();
    });

    expect(
      component.root.findAllByType(Text).some(
        node => node.props.children === 'Imagen obligatorio',
      ),
    ).toBe(true);

    expect(
      component.root.findAllByType(Text).some(
        node => node.props.children === 'Documento obligatorio',
      ),
    ).toBe(true);

    expect(registerMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();

    act(() => {
      component.unmount();
    });
  });

  it('registra al usuario con los datos correctos y navega a Tab', async () => {
    const component = await renderRegister();

    await fillForm(component);
    await uploadRequiredFiles(component);

    await act(async () => {
      component.root
        .findByProps({testID: 'register-button'})
        .props.onPress();
    });

    expect(registerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Carlos Pérez',
        phone: '3001234567',
        identification: '123456789',
        email: 'carlos@example.com',
        password: 'secret123',
        password_confirmation: 'secret123',
        type_identification: 1,
        images: 'https://example.com/profile.jpg',
        identification_document: 'https://example.com/documento.pdf',
        driving_license_document: 'https://example.com/documento.pdf',
      }),
    );

    expect(clearErrorMock).toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalledWith('Tab');

    act(() => {
      component.unmount();
    });
  });

  it('muestra Iniciando... y deshabilita el botón mientras carga', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      register: registerMock,
      isLoading: true,
      error: null,
      clearError: clearErrorMock,
    });

    const component = await renderRegister();

    const button = component.root.findByProps({
      testID: 'register-button',
    });

    expect(button.props.disabled).toBe(true);
    expect(button.findByType(Text).props.children).toBe('Iniciando...');

    act(() => {
      component.unmount();
    });
  });

  it('abre la cámara para seleccionar la imagen de perfil', async () => {
    const component = await renderRegister();

    await act(async () => {
      component.root.findByProps({testID: 'take-photo'}).props.onPress();
    });

    expect(openCamera).toHaveBeenCalled();

    act(() => {
      component.unmount();
    });
  });

  it('abre la galería para seleccionar la imagen de perfil', async () => {
    const component = await renderRegister();

    await act(async () => {
      component.root.findByProps({testID: 'open-gallery'}).props.onPress();
    });

    expect(openGallery).toHaveBeenCalled();

    act(() => {
      component.unmount();
    });
  });

  it('no registra al usuario si faltan datos obligatorios del formulario', async () => {
    const component = await renderRegister();

    await act(async () => {
      component.root
        .findByProps({testID: 'take-photo'})
        .props.onPress();
    });

    const identityButton = component.root
      .findAllByType(Pressable)
      .find(node =>
        node
          .findAllByType(Text)
          .some(
            textNode =>
              textNode.props.children ===
              'Subir Documento de Identidad...',
          ),
      );

    await act(async () => {
      identityButton!.props.onPress();
    });

    const licenseButton = component.root
      .findAllByType(Pressable)
      .find(node =>
        node
          .findAllByType(Text)
          .some(
            textNode =>
              textNode.props.children ===
              'Subir Licencia de Conducción...',
          ),
      );

    await act(async () => {
      licenseButton!.props.onPress();
    });

    await act(async () => {
      component.root
        .findByProps({testID: 'register-button'})
        .props.onPress();
    });

    expect(registerMock).not.toHaveBeenCalled();

    act(() => {
      component.unmount();
    });
  });
});
