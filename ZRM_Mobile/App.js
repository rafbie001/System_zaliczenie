import React, { useEffect, useState, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import ekranów
import ReportsList from './src/screens/ReportsList';
import ReportDetails from './src/screens/ReportDetails';

const Stack = createStackNavigator();

// Ustawienia powiadomień Expo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Funkcja rejestracji tokena push
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
      Alert.alert('Błąd', 'Nie uzyskano pozwolenia na powiadomienia!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    try {
      await AsyncStorage.setItem('expoPushToken', token);
      await axios.post('http://10.0.2.2:5000/api/push-token', { expoPushToken: token });
      console.log('Token wysłany do backendu');
    } catch (error) {
      console.error('Błąd wysyłania tokena do backendu:', error);
    }
  } else {
    Alert.alert('Błąd', 'Powiadomienia push działają najlepiej na fizycznym urządzeniu!');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
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
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('Powiadomienie odebrane:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Użytkownik kliknął powiadomienie:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ReportsList">
        <Stack.Screen name="ReportsList" component={ReportsList} options={{ title: 'Lista Zgłoszeń' }} />
        <Stack.Screen name="ReportDetails" component={ReportDetails} options={{ title: 'Szczegóły zgłoszenia' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
