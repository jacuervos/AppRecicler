import {PermissionsAndroid, Platform} from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = 'fcm_token';
const NOTIFEE_CHANNEL_ID = 'default';
const messaging = getMessaging();

type UnsubscribeFn = () => void;

interface PushNotificationListeners {
  onToken?: (token: string) => Promise<void> | void;
  onNotificationOpen?: (message: RemoteMessage) => Promise<void> | void;
  onForegroundMessage?: (message: RemoteMessage) => Promise<void> | void;
}

class PushNotificationService {
  private static instance: PushNotificationService;

  private async ensureNotificationChannel(): Promise<string> {
    if (Platform.OS !== 'android') {
      return NOTIFEE_CHANNEL_ID;
    }

    return notifee.createChannel({
      id: NOTIFEE_CHANNEL_ID,
      name: 'General',
      importance: AndroidImportance.HIGH,
    });
  }

  private async displayNotification(message: RemoteMessage): Promise<void> {
    const title = message.notification?.title ?? message.data?.title;
    const body = message.notification?.body ?? message.data?.body;

    if (!title && !body) {
      return;
    }

    const channelId = await this.ensureNotificationChannel();

    await notifee.displayNotification({
      title: title ?? 'Nueva notificacion',
      body: body ?? 'Tienes una nueva alerta',
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const androidPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (androidPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }

      const authStatus = await messaging.requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      return enabled;
    } catch (error) {
      console.error('Error requesting push notification permissions:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await messaging.getToken();
      if (token) {
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      }
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(FCM_TOKEN_KEY);
    } catch (error) {
      console.error('Error reading stored FCM token:', error);
      return null;
    }
  }

  setupListeners(listeners?: PushNotificationListeners): UnsubscribeFn {
    const unsubscribeOnMessage = messaging.onMessage(
      async (remoteMessage: RemoteMessage) => {
        listeners?.onForegroundMessage?.(remoteMessage);
        await this.displayNotification(remoteMessage);
      },
    );

    const unsubscribeOnNotificationOpened = messaging.onNotificationOpenedApp(
      (remoteMessage: RemoteMessage) => {
        if (remoteMessage) {
          listeners?.onNotificationOpen?.(remoteMessage);
        }
      },
    );

    messaging
      .getInitialNotification()
      .then((remoteMessage: RemoteMessage | null) => {
        if (remoteMessage) {
          listeners?.onNotificationOpen?.(remoteMessage);
        }
      })
      .catch((error: unknown) => {
        console.error('Error getting initial notification:', error);
      });

    const unsubscribeTokenRefresh = messaging.onTokenRefresh(
      async (token: string) => {
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
        await listeners?.onToken?.(token);
      },
    );

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpened();
      unsubscribeTokenRefresh();
    };
  }

  async initialize(listeners?: PushNotificationListeners): Promise<UnsubscribeFn> {
    await this.ensureNotificationChannel();

    const hasPermission = await this.requestPermissions();

    if (!hasPermission) {
      console.warn('Push notifications permission denied');
      return () => {};
    }

    const token = await this.getToken();

    if (token && listeners?.onToken) {
      await listeners.onToken(token);
    }

    return this.setupListeners(listeners);
  }
}

const pushNotificationService = PushNotificationService.getInstance();

export default pushNotificationService;
