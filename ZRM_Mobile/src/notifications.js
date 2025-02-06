// src/notifications.js
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token;

  // W emulatorze push notifications na fizycznych urządzeniach mogą działać lepiej,
  // ale Android Emulator obsługuje je, jeśli skonfigurowany jest odpowiednio.
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Nie udało się uzyskać uprawnień do powiadomień!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Token powiadomień push:', token);
  } else {
    alert('Musisz używać fizycznego urządzenia do testowania powiadomień push (lub odpowiednio skonfigurowanego emulatora)!');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
