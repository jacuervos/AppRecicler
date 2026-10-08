/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    BottomSheetModalProvider: ({children}: {children: React.ReactNode}) => children,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    GestureHandlerRootView: ({children}: {children: React.ReactNode}) => children,
  };
});

jest.mock('../src/navigations/Navigation', () => 'Navigation');

jest.mock('../src/services/pushNotificationService', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn().mockResolvedValue(() => {}),
  },
}));

jest.mock('../src/services/authApiService', () => ({
  authApiService: {
    isAuthenticated: jest.fn().mockResolvedValue(false),
    updateFirebaseToken: jest.fn(),
  },
}));

it('renders correctly', () => {
  renderer.create(<App />);
});
