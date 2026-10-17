/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';
import {it, expect, describe, beforeEach, jest as jestGlobals} from '@jest/globals';
import renderer, {act} from 'react-test-renderer';
import pushNotificationService from '../src/services/pushNotificationService';
import {authApiService} from '../src/services/authApiService';

jest.mock('@gorhom/bottom-sheet', () => {
  const ReactMock = require('react');
  return {
    BottomSheetModalProvider: ({children}: {children: React.ReactNode}) =>
      ReactMock.createElement(ReactMock.Fragment, null, children),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const ReactMock = require('react');
  return {
    GestureHandlerRootView: ({children}: {children: React.ReactNode}) =>
      ReactMock.createElement(ReactMock.Fragment, null, children),
  };
});

jest.mock('../src/navigations/Navigation', () => 'Navigation');

jest.mock('../src/services/pushNotificationService', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
  },
}));

jest.mock('../src/services/authApiService', () => ({
  authApiService: {
    isAuthenticated: jest.fn(),
    updateFirebaseToken: jest.fn(),
  },
}));

describe('App (HU-6 AppRecicler)', () => {
  beforeEach(() => {
    jestGlobals.clearAllMocks();
  });

  it('renders correctly, syncs firebase token when authenticated, and cleans up on unmount', async () => {
    const unsubscribeMock = jestGlobals.fn();
    let capturedOnToken: ((token: string) => Promise<void>) | undefined;

    (pushNotificationService.initialize as any).mockImplementation(
      async ({onToken}: {onToken: (token: string) => Promise<void>}) => {
        capturedOnToken = onToken;
        return unsubscribeMock;
      },
    );

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<App />);
    });

    expect(pushNotificationService.initialize).toHaveBeenCalledTimes(1);

    // Unauthenticated branch
    (authApiService.isAuthenticated as any).mockResolvedValueOnce(false);
    await act(async () => {
      await capturedOnToken?.('fcm-token-1');
    });
    expect(authApiService.updateFirebaseToken).not.toHaveBeenCalled();

    // Authenticated success branch
    (authApiService.isAuthenticated as any).mockResolvedValueOnce(true);
    (authApiService.updateFirebaseToken as any).mockResolvedValueOnce(undefined);
    await act(async () => {
      await capturedOnToken?.('fcm-token-2');
    });
    expect(authApiService.updateFirebaseToken).toHaveBeenCalledWith('fcm-token-2');

    // Authenticated error branch
    const warnSpy = jestGlobals.spyOn(console, 'warn').mockImplementation(() => {});
    (authApiService.isAuthenticated as any).mockResolvedValueOnce(true);
    (authApiService.updateFirebaseToken as any).mockRejectedValueOnce(new Error('sync failed'));
    await act(async () => {
      await capturedOnToken?.('fcm-token-3');
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();

    await act(async () => {
      tree!.unmount();
    });
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
