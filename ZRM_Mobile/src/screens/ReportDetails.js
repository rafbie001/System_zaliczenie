// src/screens/ReportDetails.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../api';

const ReportDetails = ({ route, navigation }) => {
  const { report } = route.params;
  const [cisnienie, setCisnienie] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [saturacja, setSaturacja] = useState('');
  const [opis, setOpis] = useState('');

  const handleSubmit = async () => {
    // Przygotowanie danych do wysłania
    const payload = {
      cisnienie,
      temperatura,
      saturacja,
      opis,
    };

    try {
      // Zakładamy, że backend przyjmuje PUT (lub POST) na endpoint aktualizacji zgłoszenia.
      // Upewnij się, jaki endpoint i metodę powinieneś użyć – poniższy kod jest przykładowy.
      await api.put(`/dispatches/${dispatches._id}`, payload);
      Alert.alert('Sukces', 'Dane zostały wysłane do bazy.');
      navigation.goBack();
    } catch (error) {
      console.error('Błąd wysyłania danych:', error);
      Alert.alert('Błąd', 'Nie udało się wysłać danych.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ marginBottom: 8 }}>Szczegóły zgłoszenia: {report.id}</Text>

      <Text>Ciśnienie:</Text>
      <TextInput
        value={cisnienie}
        onChangeText={setCisnienie}
        placeholder="Wpisz ciśnienie"
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }}
      />

      <Text>Temperatura:</Text>
      <TextInput
        value={temperatura}
        onChangeText={setTemperatura}
        placeholder="Wpisz temperaturę"
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }}
      />

      <Text>Saturacja:</Text>
      <TextInput
        value={saturacja}
        onChangeText={setSaturacja}
        placeholder="Wpisz saturację"
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }}
      />

      <Text>Opis obrażeń:</Text>
      <TextInput
        value={opis}
        onChangeText={setOpis}
        placeholder="Opisz inne obrażenia"
        multiline
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8, height: 80 }}
      />

      <Button title="Wyślij dane" onPress={handleSubmit} />
    </View>
  );
};

export default ReportDetails;
