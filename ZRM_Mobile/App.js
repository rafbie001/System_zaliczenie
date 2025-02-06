// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './src/notifications';

// Importuj swoje ekrany – utworzymy je za chwilę
import ReportsList from './src/screens/ReportsList';
import ReportDetails from './src/screens/ReportDetails';

const Stack = createStackNavigator();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Błąd', 'Nie udało się uzyskać uprawnień do powiadomień!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    // Wyślij token do backendu – wywołaj endpoint rejestracji tokena
    try {
      await axios.post('http://10.0.2.2:5000/api/push-token', { expoPushToken: token });
      console.log('Token wysłany do backendu');
    } catch (error) {
      console.error('Błąd wysyłania tokena do backendu:', error);
    }
  } else {
    Alert.alert('Błąd', 'Powiadomienia push działają najlepiej na fizycznym urządzeniu!');
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

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Odebrano powiadomienie:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Reakcja na powiadomienie:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);


export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    // Rejestracja powiadomień push
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Listener na odebrane powiadomienia
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Odebrano powiadomienie:', notification);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ReportsList" component={ReportsList} options={{ title: 'Lista Zgłoszeń' }} />
        <Stack.Screen name="ReportDetails" component={ReportDetails} options={{ title: 'Szczegóły zgłoszenia' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
