/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

const NOTIFEE_CHANNEL_ID = 'default';

messaging().setBackgroundMessageHandler(async remoteMessage => {
	const title = remoteMessage.notification?.title ?? remoteMessage.data?.title;
	const body = remoteMessage.notification?.body ?? remoteMessage.data?.body;

	if (!title && !body) {
		return;
	}

	const channelId = await notifee.createChannel({
		id: NOTIFEE_CHANNEL_ID,
		name: 'General',
		importance: AndroidImportance.HIGH,
	});

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
});

AppRegistry.registerComponent(appName, () => App);
